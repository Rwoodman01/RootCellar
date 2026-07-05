import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { currentYear } from "../../shared/utils/dates";
import { makeId } from "../../shared/utils/id";
import { loadRootcellarData, saveRootcellarData } from "../../shared/storage/rootcellarStorage";
import type { PreservationItem, PreservationPlan, PreservationSession } from "./types";

interface PlanInput {
  title: string;
  householdName: string;
  seasonYear: number;
  notes: string;
}

type ItemInput = Omit<PreservationItem, "id" | "createdAt" | "updatedAt">;
type SessionInput = Omit<PreservationSession, "id" | "createdAt" | "updatedAt">;

interface PreservationContextValue {
  plans: PreservationPlan[];
  createPlan: (input: Partial<PlanInput>) => PreservationPlan;
  updatePlan: (planId: string, input: PlanInput) => void;
  deletePlan: (planId: string) => void;
  addItem: (planId: string, input: ItemInput) => PreservationItem;
  updateItem: (planId: string, itemId: string, input: ItemInput) => void;
  deleteItem: (planId: string, itemId: string) => void;
  addSession: (planId: string, input: SessionInput) => PreservationSession;
  updateSession: (planId: string, sessionId: string, input: SessionInput) => void;
  deleteSession: (planId: string, sessionId: string) => void;
}

const PreservationContext = createContext<PreservationContextValue | null>(null);

export function PreservationProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<PreservationPlan[]>(() => loadRootcellarData().preservationPlans);

  useEffect(() => {
    const current = loadRootcellarData();
    saveRootcellarData({
      ...current,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      preservationPlans: plans,
    });
  }, [plans]);

  const createPlan = useCallback((input: Partial<PlanInput>) => {
    const now = new Date().toISOString();
    const plan: PreservationPlan = {
      id: makeId("plan"),
      title: input.title?.trim() || `${currentYear()} Preservation Season`,
      householdName: input.householdName?.trim() || "Our household",
      seasonYear: input.seasonYear || currentYear(),
      notes: input.notes?.trim() || "",
      items: [],
      sessions: [],
      createdAt: now,
      updatedAt: now,
    };

    setPlans((current) => [plan, ...current]);
    return plan;
  }, []);

  const updatePlan = useCallback((planId: string, input: PlanInput) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              title: input.title.trim() || plan.title,
              householdName: input.householdName.trim() || plan.householdName,
              seasonYear: input.seasonYear || plan.seasonYear,
              notes: input.notes,
              updatedAt: new Date().toISOString(),
            }
          : plan,
      ),
    );
  }, []);

  const deletePlan = useCallback((planId: string) => {
    setPlans((current) => current.filter((plan) => plan.id !== planId));
  }, []);

  const addItem = useCallback((planId: string, input: ItemInput) => {
    const now = new Date().toISOString();
    const item: PreservationItem = {
      ...input,
      id: makeId("item"),
      createdAt: now,
      updatedAt: now,
    };

    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? { ...plan, items: [...plan.items, item], updatedAt: now }
          : plan,
      ),
    );
    return item;
  }, []);

  const updateItem = useCallback((planId: string, itemId: string, input: ItemInput) => {
    const now = new Date().toISOString();

    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              items: plan.items.map((item) => (item.id === itemId ? { ...item, ...input, updatedAt: now } : item)),
              updatedAt: now,
            }
          : plan,
      ),
    );
  }, []);

  const deleteItem = useCallback((planId: string, itemId: string) => {
    const now = new Date().toISOString();

    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              items: plan.items.filter((item) => item.id !== itemId),
              sessions: plan.sessions.map((session) => ({
                ...session,
                itemIds: session.itemIds.filter((id) => id !== itemId),
              })),
              updatedAt: now,
            }
          : plan,
      ),
    );
  }, []);

  const addSession = useCallback((planId: string, input: SessionInput) => {
    const now = new Date().toISOString();
    const session: PreservationSession = {
      ...input,
      id: makeId("session"),
      createdAt: now,
      updatedAt: now,
    };

    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? { ...plan, sessions: [...plan.sessions, session], updatedAt: now }
          : plan,
      ),
    );
    return session;
  }, []);

  const updateSession = useCallback((planId: string, sessionId: string, input: SessionInput) => {
    const now = new Date().toISOString();

    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              sessions: plan.sessions.map((session) =>
                session.id === sessionId ? { ...session, ...input, updatedAt: now } : session,
              ),
              updatedAt: now,
            }
          : plan,
      ),
    );
  }, []);

  const deleteSession = useCallback((planId: string, sessionId: string) => {
    const now = new Date().toISOString();

    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              sessions: plan.sessions.filter((session) => session.id !== sessionId),
              updatedAt: now,
            }
          : plan,
      ),
    );
  }, []);

  const value = useMemo<PreservationContextValue>(
    () => ({
      plans,
      createPlan,
      updatePlan,
      deletePlan,
      addItem,
      updateItem,
      deleteItem,
      addSession,
      updateSession,
      deleteSession,
    }),
    [plans, createPlan, updatePlan, deletePlan, addItem, updateItem, deleteItem, addSession, updateSession, deleteSession],
  );

  return <PreservationContext.Provider value={value}>{children}</PreservationContext.Provider>;
}

export function usePreservationPlans(): PreservationContextValue {
  const context = useContext(PreservationContext);
  if (!context) {
    throw new Error("usePreservationPlans must be used inside PreservationProvider");
  }

  return context;
}

export function usePreservationPlan(planId?: string): PreservationPlan | undefined {
  const { plans } = usePreservationPlans();
  return plans.find((plan) => plan.id === planId);
}
