import type {
  DailyBreadEntry,
  DailyBreadItemStatus,
  DailyBreadSelectedItem,
  DailyBreadSourceType,
  HuddleData,
  HuddleModuleSource,
  OwnedWorkItem,
  OwnedWorkSourceType,
  OwnedWorkStatus,
  PriorityLinkedModule,
  PulseMetric,
  PulseMetricStatus,
  SeasonPriority,
  SeasonPriorityStatus,
  StuckItem,
  StuckItemSourceType,
  StuckItemStatus,
  WeeklyHuddleEntry,
} from "./types";

const PRIORITY_STATUSES: SeasonPriorityStatus[] = ["on_track", "off_track", "done", "paused"];
const PULSE_STATUSES: PulseMetricStatus[] = ["good", "watch", "needs_attention"];
const OWNED_WORK_STATUSES: OwnedWorkStatus[] = ["open", "done", "carried", "dropped"];
const STUCK_ITEM_STATUSES: StuckItemStatus[] = ["open", "solved", "carried", "dropped"];
const DAILY_ITEM_STATUSES: DailyBreadItemStatus[] = ["open", "done", "skipped", "carried"];
const MODULE_SOURCES: HuddleModuleSource[] = ["preservation", "pantry", "garden", "animals", "chores", "manual"];
const PRIORITY_MODULES: PriorityLinkedModule[] = ["preservation", "pantry", "garden", "animals", "chores", "manual"];
const OWNED_WORK_SOURCES: OwnedWorkSourceType[] = ["daily_bread", "weekly_huddle", "chore", "animal", "garden", "pantry", "preservation", "manual"];
const STUCK_SOURCES: StuckItemSourceType[] = ["chores", "animals", "garden", "pantry", "preservation", "daily_bread", "manual"];
const DAILY_SOURCES: DailyBreadSourceType[] = ["daily_bread", "weekly_huddle", "owned_work", "chore", "animal", "garden", "pantry", "preservation", "manual"];

export function createEmptyHuddleData(): HuddleData {
  return {
    seasonPriorities: [],
    pulseMetrics: [],
    ownedWorkItems: [],
    stuckItems: [],
    dailyBreadEntries: [],
    weeklyHuddleEntries: [],
  };
}

export function ensureHuddleData(data?: Partial<HuddleData>): HuddleData {
  return {
    seasonPriorities: Array.isArray(data?.seasonPriorities) ? data.seasonPriorities.map(ensureSeasonPriority) : [],
    pulseMetrics: Array.isArray(data?.pulseMetrics) ? data.pulseMetrics.map(ensurePulseMetric) : [],
    ownedWorkItems: Array.isArray(data?.ownedWorkItems) ? data.ownedWorkItems.map(ensureOwnedWorkItem) : [],
    stuckItems: Array.isArray(data?.stuckItems) ? data.stuckItems.map(ensureStuckItem) : [],
    dailyBreadEntries: Array.isArray(data?.dailyBreadEntries) ? data.dailyBreadEntries.map(ensureDailyBreadEntry) : [],
    weeklyHuddleEntries: Array.isArray(data?.weeklyHuddleEntries) ? data.weeklyHuddleEntries.map(ensureWeeklyHuddleEntry) : [],
  };
}

function ensureSeasonPriority(priority: Partial<SeasonPriority>): SeasonPriority {
  const now = new Date().toISOString();
  return {
    id: priority.id || "",
    title: priority.title?.trim() || "Untitled priority",
    ownerMemberId: priority.ownerMemberId || undefined,
    status: PRIORITY_STATUSES.includes(priority.status as SeasonPriorityStatus) ? (priority.status as SeasonPriorityStatus) : "on_track",
    startDate: priority.startDate || undefined,
    targetDate: priority.targetDate || undefined,
    notes: priority.notes || "",
    linkedModule: PRIORITY_MODULES.includes(priority.linkedModule as PriorityLinkedModule) ? (priority.linkedModule as PriorityLinkedModule) : "manual",
    createdAt: priority.createdAt || now,
    updatedAt: priority.updatedAt || now,
  };
}

function ensurePulseMetric(metric: Partial<PulseMetric>): PulseMetric {
  return {
    id: metric.id || "",
    title: metric.title?.trim() || "Untitled pulse",
    value: String(metric.value ?? ""),
    target: metric.target || "",
    unit: metric.unit || "",
    status: PULSE_STATUSES.includes(metric.status as PulseMetricStatus) ? (metric.status as PulseMetricStatus) : "watch",
    sourceType: MODULE_SOURCES.includes(metric.sourceType as HuddleModuleSource) ? (metric.sourceType as HuddleModuleSource) : "manual",
    sourceId: metric.sourceId || undefined,
    weekStart: metric.weekStart || undefined,
    notes: metric.notes || "",
  };
}

function ensureOwnedWorkItem(item: Partial<OwnedWorkItem>): OwnedWorkItem {
  const now = new Date().toISOString();
  return {
    id: item.id || "",
    title: item.title?.trim() || "Untitled work",
    ownerMemberId: item.ownerMemberId || undefined,
    dueDate: item.dueDate || undefined,
    sourceType: OWNED_WORK_SOURCES.includes(item.sourceType as OwnedWorkSourceType) ? (item.sourceType as OwnedWorkSourceType) : "manual",
    sourceId: item.sourceId || undefined,
    status: OWNED_WORK_STATUSES.includes(item.status as OwnedWorkStatus) ? (item.status as OwnedWorkStatus) : "open",
    notes: item.notes || "",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now,
  };
}

function ensureStuckItem(item: Partial<StuckItem>): StuckItem {
  const now = new Date().toISOString();
  return {
    id: item.id || "",
    title: item.title?.trim() || "Needs attention",
    details: item.details || "",
    sourceType: STUCK_SOURCES.includes(item.sourceType as StuckItemSourceType) ? (item.sourceType as StuckItemSourceType) : "manual",
    sourceId: item.sourceId || undefined,
    ownerMemberId: item.ownerMemberId || undefined,
    status: STUCK_ITEM_STATUSES.includes(item.status as StuckItemStatus) ? (item.status as StuckItemStatus) : "open",
    decision: item.decision || "",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now,
  };
}

function ensureDailyBreadEntry(entry: Partial<DailyBreadEntry>): DailyBreadEntry {
  const now = new Date().toISOString();
  return {
    id: entry.id || "",
    date: entry.date || todayDate(),
    householdNote: entry.householdNote || "",
    gratitude: entry.gratitude || "",
    prayerOrReflection: entry.prayerOrReflection || "",
    todayFocus: entry.todayFocus || "",
    selectedItems: Array.isArray(entry.selectedItems) ? entry.selectedItems.map(ensureDailyBreadItem) : [],
    completedAt: entry.completedAt || undefined,
    createdAt: entry.createdAt || now,
    updatedAt: entry.updatedAt || now,
  };
}

function ensureDailyBreadItem(item: Partial<DailyBreadSelectedItem>): DailyBreadSelectedItem {
  return {
    sourceType: DAILY_SOURCES.includes(item.sourceType as DailyBreadSourceType) ? (item.sourceType as DailyBreadSourceType) : "manual",
    sourceId: item.sourceId || undefined,
    title: item.title?.trim() || "Untitled item",
    ownerMemberId: item.ownerMemberId || undefined,
    status: DAILY_ITEM_STATUSES.includes(item.status as DailyBreadItemStatus) ? (item.status as DailyBreadItemStatus) : "open",
    note: item.note || "",
  };
}

function ensureWeeklyHuddleEntry(entry: Partial<WeeklyHuddleEntry>): WeeklyHuddleEntry {
  const now = new Date().toISOString();
  const weekStart = entry.weekStart || todayDate();
  return {
    id: entry.id || "",
    weekStart,
    weekEnd: entry.weekEnd || weekStart,
    pulseReviewed: Boolean(entry.pulseReviewed),
    prioritiesReviewed: Boolean(entry.prioritiesReviewed),
    ownedWorkReviewed: Boolean(entry.ownedWorkReviewed),
    stuckListReviewed: Boolean(entry.stuckListReviewed),
    wins: stringArray(entry.wins),
    pulseNotes: entry.pulseNotes || "",
    priorityNotes: entry.priorityNotes || "",
    stuckItems: stringArray(entry.stuckItems),
    decisions: stringArray(entry.decisions),
    nextWeekFocus: stringArray(entry.nextWeekFocus),
    carryForwardItems: stringArray(entry.carryForwardItems),
    completedAt: entry.completedAt || undefined,
    createdAt: entry.createdAt || now,
    updatedAt: entry.updatedAt || now,
  };
}

function stringArray(value?: string[]): string[] {
  return Array.isArray(value) ? value.filter((entry) => entry.trim()).map((entry) => entry.trim()) : [];
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
