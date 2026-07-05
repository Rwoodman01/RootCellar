import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadRootcellarData, saveRootcellarData } from "../../shared/storage/rootcellarStorage";
import { makeId } from "../../shared/utils/id";
import { ensureHuddleData } from "./huddleData";
import type {
  DailyBreadEntry,
  DailyBreadItemStatus,
  DailyBreadSelectedItem,
  HuddleData,
  OwnedWorkItem,
  OwnedWorkItemInput,
  OwnedWorkStatus,
  PulseMetric,
  PulseMetricInput,
  SeasonPriority,
  SeasonPriorityInput,
  StuckItem,
  StuckItemInput,
  WeeklyHuddleEntry,
} from "./types";

interface DailyBreadNotesInput {
  householdNote?: string;
  gratitude?: string;
  prayerOrReflection?: string;
  todayFocus?: string;
}

interface WeeklyHuddlePatch {
  pulseReviewed?: boolean;
  prioritiesReviewed?: boolean;
  ownedWorkReviewed?: boolean;
  stuckListReviewed?: boolean;
  wins?: string[];
  pulseNotes?: string;
  priorityNotes?: string;
  stuckItems?: string[];
  decisions?: string[];
  nextWeekFocus?: string[];
  carryForwardItems?: string[];
}

interface HuddleContextValue {
  data: HuddleData;
  addSeasonPriority: (input: SeasonPriorityInput) => SeasonPriority;
  updateSeasonPriority: (priorityId: string, input: SeasonPriorityInput) => void;
  deleteSeasonPriority: (priorityId: string) => void;
  addPulseMetric: (input: PulseMetricInput) => PulseMetric;
  updatePulseMetric: (metricId: string, input: PulseMetricInput) => void;
  deletePulseMetric: (metricId: string) => void;
  addOwnedWorkItem: (input: OwnedWorkItemInput) => OwnedWorkItem;
  updateOwnedWorkItem: (itemId: string, input: OwnedWorkItemInput) => void;
  updateOwnedWorkStatus: (itemId: string, status: OwnedWorkStatus) => void;
  deleteOwnedWorkItem: (itemId: string) => void;
  addStuckItem: (input: StuckItemInput) => StuckItem;
  updateStuckItem: (itemId: string, input: StuckItemInput) => void;
  deleteStuckItem: (itemId: string) => void;
  updateDailyBreadNotes: (date: string, input: DailyBreadNotesInput) => DailyBreadEntry;
  setDailyBreadItemStatus: (date: string, item: DailyBreadSelectedItem, status: DailyBreadItemStatus) => DailyBreadEntry;
  completeDailyBread: (date: string) => void;
  updateWeeklyHuddle: (weekStart: string, weekEnd: string, patch: WeeklyHuddlePatch) => WeeklyHuddleEntry;
  completeWeeklyHuddle: (weekStart: string, weekEnd: string) => void;
}

const HuddleContext = createContext<HuddleContextValue | null>(null);

export function HuddleProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HuddleData>(() => ensureHuddleData(loadRootcellarData().huddle));

  useEffect(() => {
    const current = loadRootcellarData();
    saveRootcellarData({
      ...current,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      huddle: data,
    });
  }, [data]);

  const addSeasonPriority = useCallback((input: SeasonPriorityInput) => {
    const now = new Date().toISOString();
    const priority: SeasonPriority = {
      ...input,
      id: makeId("priority"),
      title: input.title.trim() || "Untitled priority",
      ownerMemberId: input.ownerMemberId || undefined,
      notes: input.notes?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, seasonPriorities: [priority, ...current.seasonPriorities] }));
    return priority;
  }, []);

  const updateSeasonPriority = useCallback((priorityId: string, input: SeasonPriorityInput) => {
    setData((current) => ({
      ...current,
      seasonPriorities: current.seasonPriorities.map((priority) =>
        priority.id === priorityId
          ? {
              ...priority,
              ...input,
              title: input.title.trim() || priority.title,
              ownerMemberId: input.ownerMemberId || undefined,
              notes: input.notes?.trim() || "",
              updatedAt: new Date().toISOString(),
            }
          : priority,
      ),
    }));
  }, []);

  const deleteSeasonPriority = useCallback((priorityId: string) => {
    setData((current) => ({ ...current, seasonPriorities: current.seasonPriorities.filter((priority) => priority.id !== priorityId) }));
  }, []);

  const addPulseMetric = useCallback((input: PulseMetricInput) => {
    const metric: PulseMetric = {
      ...input,
      id: makeId("pulse"),
      title: input.title.trim() || "Untitled pulse",
      value: String(input.value || ""),
      target: input.target?.trim() || "",
      unit: input.unit?.trim() || "",
      notes: input.notes?.trim() || "",
    };
    setData((current) => ({ ...current, pulseMetrics: [metric, ...current.pulseMetrics] }));
    return metric;
  }, []);

  const updatePulseMetric = useCallback((metricId: string, input: PulseMetricInput) => {
    setData((current) => ({
      ...current,
      pulseMetrics: current.pulseMetrics.map((metric) =>
        metric.id === metricId
          ? {
              ...metric,
              ...input,
              title: input.title.trim() || metric.title,
              value: String(input.value || ""),
              target: input.target?.trim() || "",
              unit: input.unit?.trim() || "",
              notes: input.notes?.trim() || "",
            }
          : metric,
      ),
    }));
  }, []);

  const deletePulseMetric = useCallback((metricId: string) => {
    setData((current) => ({ ...current, pulseMetrics: current.pulseMetrics.filter((metric) => metric.id !== metricId) }));
  }, []);

  const addOwnedWorkItem = useCallback((input: OwnedWorkItemInput) => {
    const now = new Date().toISOString();
    const item: OwnedWorkItem = {
      ...input,
      id: makeId("work"),
      title: input.title.trim() || "Untitled work",
      ownerMemberId: input.ownerMemberId || undefined,
      dueDate: input.dueDate || undefined,
      sourceId: input.sourceId || undefined,
      notes: input.notes?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, ownedWorkItems: [item, ...current.ownedWorkItems] }));
    return item;
  }, []);

  const updateOwnedWorkItem = useCallback((itemId: string, input: OwnedWorkItemInput) => {
    setData((current) => ({
      ...current,
      ownedWorkItems: current.ownedWorkItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...input,
              title: input.title.trim() || item.title,
              ownerMemberId: input.ownerMemberId || undefined,
              dueDate: input.dueDate || undefined,
              sourceId: input.sourceId || undefined,
              notes: input.notes?.trim() || "",
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    }));
  }, []);

  const updateOwnedWorkStatus = useCallback((itemId: string, status: OwnedWorkStatus) => {
    setData((current) => ({
      ...current,
      ownedWorkItems: current.ownedWorkItems.map((item) =>
        item.id === itemId ? { ...item, status, updatedAt: new Date().toISOString() } : item,
      ),
    }));
  }, []);

  const deleteOwnedWorkItem = useCallback((itemId: string) => {
    setData((current) => ({ ...current, ownedWorkItems: current.ownedWorkItems.filter((item) => item.id !== itemId) }));
  }, []);

  const addStuckItem = useCallback((input: StuckItemInput) => {
    const now = new Date().toISOString();
    const item: StuckItem = {
      ...input,
      id: makeId("stuck"),
      title: input.title.trim() || "Needs attention",
      details: input.details?.trim() || "",
      ownerMemberId: input.ownerMemberId || undefined,
      sourceId: input.sourceId || undefined,
      decision: input.decision?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, stuckItems: [item, ...current.stuckItems] }));
    return item;
  }, []);

  const updateStuckItem = useCallback((itemId: string, input: StuckItemInput) => {
    setData((current) => ({
      ...current,
      stuckItems: current.stuckItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...input,
              title: input.title.trim() || item.title,
              details: input.details?.trim() || "",
              ownerMemberId: input.ownerMemberId || undefined,
              sourceId: input.sourceId || undefined,
              decision: input.decision?.trim() || "",
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    }));
  }, []);

  const deleteStuckItem = useCallback((itemId: string) => {
    setData((current) => ({ ...current, stuckItems: current.stuckItems.filter((item) => item.id !== itemId) }));
  }, []);

  const updateDailyBreadNotes = useCallback((date: string, input: DailyBreadNotesInput) => {
    const now = new Date().toISOString();
    let saved = createDailyBreadEntry(date, now, input);
    setData((current) => {
      const existing = current.dailyBreadEntries.find((entry) => entry.date === date);
      if (existing) {
        saved = {
          ...existing,
          ...input,
          updatedAt: now,
        };
        return {
          ...current,
          dailyBreadEntries: current.dailyBreadEntries.map((entry) => (entry.date === date ? saved : entry)),
        };
      }
      return { ...current, dailyBreadEntries: [saved, ...current.dailyBreadEntries] };
    });
    return saved;
  }, []);

  const setDailyBreadItemStatus = useCallback((date: string, item: DailyBreadSelectedItem, status: DailyBreadItemStatus) => {
    const now = new Date().toISOString();
    let saved = createDailyBreadEntry(date, now);
    const nextItem: DailyBreadSelectedItem = {
      ...item,
      sourceId: item.sourceId || undefined,
      ownerMemberId: item.ownerMemberId || undefined,
      status,
    };
    setData((current) => {
      const existing = current.dailyBreadEntries.find((entry) => entry.date === date);
      if (existing) {
        const itemExists = existing.selectedItems.some((entry) => dailyItemKey(entry) === dailyItemKey(nextItem));
        saved = {
          ...existing,
          selectedItems: itemExists
            ? existing.selectedItems.map((entry) => (dailyItemKey(entry) === dailyItemKey(nextItem) ? { ...entry, ...nextItem } : entry))
            : [nextItem, ...existing.selectedItems],
          updatedAt: now,
        };
        return {
          ...current,
          dailyBreadEntries: current.dailyBreadEntries.map((entry) => (entry.date === date ? saved : entry)),
        };
      }
      saved = { ...saved, selectedItems: [nextItem] };
      return { ...current, dailyBreadEntries: [saved, ...current.dailyBreadEntries] };
    });
    return saved;
  }, []);

  const completeDailyBread = useCallback((date: string) => {
    const now = new Date().toISOString();
    setData((current) => {
      const existing = current.dailyBreadEntries.find((entry) => entry.date === date);
      const saved = existing
        ? { ...existing, completedAt: now, updatedAt: now }
        : { ...createDailyBreadEntry(date, now), completedAt: now };
      return {
        ...current,
        dailyBreadEntries: existing
          ? current.dailyBreadEntries.map((entry) => (entry.date === date ? saved : entry))
          : [saved, ...current.dailyBreadEntries],
      };
    });
  }, []);

  const updateWeeklyHuddle = useCallback((weekStart: string, weekEnd: string, patch: WeeklyHuddlePatch) => {
    const now = new Date().toISOString();
    let saved = createWeeklyHuddleEntry(weekStart, weekEnd, now, patch);
    setData((current) => {
      const existing = current.weeklyHuddleEntries.find((entry) => entry.weekStart === weekStart);
      if (existing) {
        saved = {
          ...existing,
          ...patch,
          wins: patch.wins ? cleanList(patch.wins) : existing.wins,
          stuckItems: patch.stuckItems ? cleanList(patch.stuckItems) : existing.stuckItems,
          decisions: patch.decisions ? cleanList(patch.decisions) : existing.decisions,
          nextWeekFocus: patch.nextWeekFocus ? cleanList(patch.nextWeekFocus) : existing.nextWeekFocus,
          carryForwardItems: patch.carryForwardItems ? cleanList(patch.carryForwardItems) : existing.carryForwardItems,
          updatedAt: now,
        };
        return {
          ...current,
          weeklyHuddleEntries: current.weeklyHuddleEntries.map((entry) => (entry.weekStart === weekStart ? saved : entry)),
        };
      }
      return { ...current, weeklyHuddleEntries: [saved, ...current.weeklyHuddleEntries] };
    });
    return saved;
  }, []);

  const completeWeeklyHuddle = useCallback((weekStart: string, weekEnd: string) => {
    const now = new Date().toISOString();
    setData((current) => {
      const existing = current.weeklyHuddleEntries.find((entry) => entry.weekStart === weekStart);
      const saved = existing
        ? { ...existing, completedAt: now, updatedAt: now }
        : { ...createWeeklyHuddleEntry(weekStart, weekEnd, now), completedAt: now };
      return {
        ...current,
        weeklyHuddleEntries: existing
          ? current.weeklyHuddleEntries.map((entry) => (entry.weekStart === weekStart ? saved : entry))
          : [saved, ...current.weeklyHuddleEntries],
      };
    });
  }, []);

  const value = useMemo<HuddleContextValue>(
    () => ({
      data,
      addSeasonPriority,
      updateSeasonPriority,
      deleteSeasonPriority,
      addPulseMetric,
      updatePulseMetric,
      deletePulseMetric,
      addOwnedWorkItem,
      updateOwnedWorkItem,
      updateOwnedWorkStatus,
      deleteOwnedWorkItem,
      addStuckItem,
      updateStuckItem,
      deleteStuckItem,
      updateDailyBreadNotes,
      setDailyBreadItemStatus,
      completeDailyBread,
      updateWeeklyHuddle,
      completeWeeklyHuddle,
    }),
    [
      data,
      addSeasonPriority,
      updateSeasonPriority,
      deleteSeasonPriority,
      addPulseMetric,
      updatePulseMetric,
      deletePulseMetric,
      addOwnedWorkItem,
      updateOwnedWorkItem,
      updateOwnedWorkStatus,
      deleteOwnedWorkItem,
      addStuckItem,
      updateStuckItem,
      deleteStuckItem,
      updateDailyBreadNotes,
      setDailyBreadItemStatus,
      completeDailyBread,
      updateWeeklyHuddle,
      completeWeeklyHuddle,
    ],
  );

  return <HuddleContext.Provider value={value}>{children}</HuddleContext.Provider>;
}

export function useHuddle(): HuddleContextValue {
  const context = useContext(HuddleContext);
  if (!context) {
    throw new Error("useHuddle must be used inside HuddleProvider");
  }

  return context;
}

function createDailyBreadEntry(date: string, now: string, input: DailyBreadNotesInput = {}): DailyBreadEntry {
  return {
    id: makeId("daily-bread"),
    date,
    householdNote: input.householdNote || "",
    gratitude: input.gratitude || "",
    prayerOrReflection: input.prayerOrReflection || "",
    todayFocus: input.todayFocus || "",
    selectedItems: [],
    createdAt: now,
    updatedAt: now,
  };
}

function createWeeklyHuddleEntry(weekStart: string, weekEnd: string, now: string, patch: WeeklyHuddlePatch = {}): WeeklyHuddleEntry {
  return {
    id: makeId("weekly-huddle"),
    weekStart,
    weekEnd,
    pulseReviewed: Boolean(patch.pulseReviewed),
    prioritiesReviewed: Boolean(patch.prioritiesReviewed),
    ownedWorkReviewed: Boolean(patch.ownedWorkReviewed),
    stuckListReviewed: Boolean(patch.stuckListReviewed),
    wins: cleanList(patch.wins || []),
    pulseNotes: patch.pulseNotes || "",
    priorityNotes: patch.priorityNotes || "",
    stuckItems: cleanList(patch.stuckItems || []),
    decisions: cleanList(patch.decisions || []),
    nextWeekFocus: cleanList(patch.nextWeekFocus || []),
    carryForwardItems: cleanList(patch.carryForwardItems || []),
    createdAt: now,
    updatedAt: now,
  };
}

function dailyItemKey(item: DailyBreadSelectedItem): string {
  return `${item.sourceType}:${item.sourceId || item.title}`;
}

function cleanList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}
