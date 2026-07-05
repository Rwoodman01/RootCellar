export type PantryCategory =
  | "jars-canned"
  | "freezer"
  | "bulk-meat"
  | "dry-bulk"
  | "root-cellar"
  | "dehydrated"
  | "fermented"
  | "other";

export type PantryUnit =
  | "half-pints"
  | "pints"
  | "quarts"
  | "jars"
  | "pounds"
  | "ounces"
  | "gallons"
  | "bags"
  | "buckets"
  | "bins"
  | "containers"
  | "each";

export type PantryMethod =
  | "pressure"
  | "water-bath"
  | "frozen"
  | "dehydrated"
  | "fermented"
  | "mylar-o2"
  | "bag"
  | "bin"
  | "bucket"
  | "other";

export type PantrySourceType = "preservation-plan" | "harvest" | "butcher-batch" | "bought" | "manual" | "future-record";

export interface PantryProduct {
  id: string;
  name: string;
  category: PantryCategory;
  defaultRotationMonths: number;
  lowStockThreshold: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PantryLocation {
  id: string;
  name: string;
  parentId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PantryBatch {
  id: string;
  productId: string;
  batchCode: string;
  quantity: number;
  unit: PantryUnit;
  originalQuantity: number;
  dateAdded: string;
  datePreserved?: string;
  dateFrozen?: string;
  datePacked?: string;
  locationId: string;
  sourceType: PantrySourceType;
  sourceId?: string;
  method?: PantryMethod;
  eatByDate?: string;
  nextCheckDate?: string;
  lastCheckedDate?: string;
  container?: string;
  packaging?: string;
  notes: string;
  photoPlaceholder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PantryTransaction {
  id: string;
  batchId: string;
  delta: number;
  memberLabel: string;
  occurredAt: string;
  note?: string;
}

export interface PantryData {
  products: PantryProduct[];
  batches: PantryBatch[];
  locations: PantryLocation[];
  transactions: PantryTransaction[];
}

export interface ProductInput {
  name: string;
  category: PantryCategory;
  defaultRotationMonths: number;
  lowStockThreshold: number;
  notes: string;
}

export type BatchInput = Omit<PantryBatch, "id" | "createdAt" | "updatedAt">;
