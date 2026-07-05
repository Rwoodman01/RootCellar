import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadRootcellarData, saveRootcellarData } from "../../shared/storage/rootcellarStorage";
import { makeId } from "../../shared/utils/id";
import { DEFAULT_LOCATION_NAMES } from "./constants";
import { getOpenBatches } from "./pantryUtils";
import type { BatchInput, PantryBatch, PantryData, PantryLocation, PantryProduct, PantryTransaction, ProductInput } from "./types";

interface UseOneResult {
  transaction: PantryTransaction;
  product: PantryProduct;
  batch: PantryBatch;
}

interface PantryContextValue {
  data: PantryData;
  addProduct: (input: ProductInput) => PantryProduct;
  updateProduct: (productId: string, input: ProductInput) => void;
  deleteProduct: (productId: string) => void;
  addBatch: (input: BatchInput) => PantryBatch;
  updateBatch: (batchId: string, input: BatchInput) => void;
  deleteBatch: (batchId: string) => void;
  adjustBatch: (batchId: string, delta: number, note?: string) => PantryTransaction | null;
  useOneFromProduct: (productId: string) => UseOneResult | null;
  undoTransaction: (transactionId: string) => void;
  markBatchUsedUp: (batchId: string) => void;
  addLocation: (name: string, parentId?: string) => PantryLocation;
}

const PantryContext = createContext<PantryContextValue | null>(null);

function createDefaultLocations(): PantryLocation[] {
  const now = new Date().toISOString();
  return DEFAULT_LOCATION_NAMES.map((name) => ({
    id: makeId("loc"),
    name,
    notes: "",
    createdAt: now,
    updatedAt: now,
  }));
}

function ensurePantryData(data: PantryData): PantryData {
  return {
    products: data.products || [],
    batches: data.batches || [],
    locations: data.locations?.length ? data.locations : createDefaultLocations(),
    transactions: data.transactions || [],
  };
}

export function PantryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PantryData>(() => ensurePantryData(loadRootcellarData().pantry));

  useEffect(() => {
    const current = loadRootcellarData();
    saveRootcellarData({
      ...current,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      pantry: data,
    });
  }, [data]);

  const addProduct = useCallback((input: ProductInput) => {
    const now = new Date().toISOString();
    const product: PantryProduct = {
      id: makeId("pantry-product"),
      name: input.name.trim(),
      category: input.category,
      defaultRotationMonths: Math.max(0, input.defaultRotationMonths),
      lowStockThreshold: Math.max(0, input.lowStockThreshold),
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, products: [product, ...current.products] }));
    return product;
  }, []);

  const updateProduct = useCallback((productId: string, input: ProductInput) => {
    setData((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              name: input.name.trim(),
              category: input.category,
              defaultRotationMonths: Math.max(0, input.defaultRotationMonths),
              lowStockThreshold: Math.max(0, input.lowStockThreshold),
              notes: input.notes,
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
    }));
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setData((current) => {
      const batchIds = current.batches.filter((batch) => batch.productId === productId).map((batch) => batch.id);
      return {
        ...current,
        products: current.products.filter((product) => product.id !== productId),
        batches: current.batches.filter((batch) => batch.productId !== productId),
        transactions: current.transactions.filter((transaction) => !batchIds.includes(transaction.batchId)),
      };
    });
  }, []);

  const addBatch = useCallback((input: BatchInput) => {
    const now = new Date().toISOString();
    const batch: PantryBatch = {
      ...input,
      id: makeId("batch"),
      quantity: Math.max(0, input.quantity),
      originalQuantity: Math.max(input.originalQuantity || input.quantity, input.quantity),
      notes: input.notes || "",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, batches: [batch, ...current.batches] }));
    return batch;
  }, []);

  const updateBatch = useCallback((batchId: string, input: BatchInput) => {
    setData((current) => ({
      ...current,
      batches: current.batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              ...input,
              quantity: Math.max(0, input.quantity),
              originalQuantity: Math.max(input.originalQuantity || input.quantity, input.quantity),
              updatedAt: new Date().toISOString(),
            }
          : batch,
      ),
    }));
  }, []);

  const deleteBatch = useCallback((batchId: string) => {
    setData((current) => ({
      ...current,
      batches: current.batches.filter((batch) => batch.id !== batchId),
      transactions: current.transactions.filter((transaction) => transaction.batchId !== batchId),
    }));
  }, []);

  const adjustBatch = useCallback((batchId: string, delta: number, note?: string) => {
    let created: PantryTransaction | null = null;
    setData((current) => {
      const batch = current.batches.find((entry) => entry.id === batchId);
      if (!batch) return current;
      const boundedDelta = delta < 0 ? Math.max(delta, -batch.quantity) : delta;
      if (boundedDelta === 0) return current;
      const now = new Date().toISOString();
      created = {
        id: makeId("txn"),
        batchId,
        delta: boundedDelta,
        memberLabel: "Household",
        occurredAt: now,
        note,
      };
      return {
        ...current,
        batches: current.batches.map((entry) =>
          entry.id === batchId ? { ...entry, quantity: Math.max(0, entry.quantity + boundedDelta), updatedAt: now } : entry,
        ),
        transactions: [created, ...current.transactions],
      };
    });
    return created;
  }, []);

  const useOneFromProduct = useCallback((productId: string) => {
    let result: UseOneResult | null = null;
    setData((current) => {
      const product = current.products.find((entry) => entry.id === productId);
      const batch = getOpenBatches(productId, current.batches)[0];
      if (!product || !batch) return current;
      const now = new Date().toISOString();
      const transaction: PantryTransaction = {
        id: makeId("txn"),
        batchId: batch.id,
        delta: -1,
        memberLabel: "Household",
        occurredAt: now,
        note: "Used one",
      };
      result = { product, batch, transaction };
      return {
        ...current,
        batches: current.batches.map((entry) =>
          entry.id === batch.id ? { ...entry, quantity: Math.max(0, entry.quantity - 1), updatedAt: now } : entry,
        ),
        transactions: [transaction, ...current.transactions],
      };
    });
    return result;
  }, []);

  const undoTransaction = useCallback((transactionId: string) => {
    setData((current) => {
      const transaction = current.transactions.find((entry) => entry.id === transactionId);
      if (!transaction) return current;
      const now = new Date().toISOString();
      return {
        ...current,
        batches: current.batches.map((batch) =>
          batch.id === transaction.batchId ? { ...batch, quantity: Math.max(0, batch.quantity - transaction.delta), updatedAt: now } : batch,
        ),
        transactions: current.transactions.filter((entry) => entry.id !== transactionId),
      };
    });
  }, []);

  const markBatchUsedUp = useCallback((batchId: string) => {
    setData((current) => {
      const batch = current.batches.find((entry) => entry.id === batchId);
      if (!batch || batch.quantity <= 0) return current;
      const now = new Date().toISOString();
      const transaction: PantryTransaction = {
        id: makeId("txn"),
        batchId,
        delta: -batch.quantity,
        memberLabel: "Household",
        occurredAt: now,
        note: "Marked used up",
      };
      return {
        ...current,
        batches: current.batches.map((entry) => (entry.id === batchId ? { ...entry, quantity: 0, updatedAt: now } : entry)),
        transactions: [transaction, ...current.transactions],
      };
    });
  }, []);

  const addLocation = useCallback((name: string, parentId?: string) => {
    const now = new Date().toISOString();
    const location: PantryLocation = {
      id: makeId("loc"),
      name: name.trim(),
      parentId,
      notes: "",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, locations: [...current.locations, location] }));
    return location;
  }, []);

  const value = useMemo<PantryContextValue>(
    () => ({
      data,
      addProduct,
      updateProduct,
      deleteProduct,
      addBatch,
      updateBatch,
      deleteBatch,
      adjustBatch,
      useOneFromProduct,
      undoTransaction,
      markBatchUsedUp,
      addLocation,
    }),
    [data, addProduct, updateProduct, deleteProduct, addBatch, updateBatch, deleteBatch, adjustBatch, useOneFromProduct, undoTransaction, markBatchUsedUp, addLocation],
  );

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry(): PantryContextValue {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error("usePantry must be used inside PantryProvider");
  }
  return context;
}

export function usePantryProduct(productId?: string): PantryProduct | undefined {
  const { data } = usePantry();
  return data.products.find((product) => product.id === productId);
}
