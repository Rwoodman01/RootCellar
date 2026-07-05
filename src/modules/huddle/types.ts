export type HuddleModuleSource = "preservation" | "pantry" | "garden" | "animals" | "chores" | "manual";
export type LinkedModuleSource = HuddleModuleSource | "daily_bread" | "weekly_huddle";

export type SeasonPriorityStatus = "on_track" | "off_track" | "done" | "paused";
export type PulseMetricStatus = "good" | "watch" | "needs_attention";
export type OwnedWorkStatus = "open" | "done" | "carried" | "dropped";
export type StuckItemStatus = "open" | "solved" | "carried" | "dropped";
export type DailyBreadItemStatus = "open" | "done" | "skipped" | "carried";

export type PriorityLinkedModule = "preservation" | "pantry" | "garden" | "animals" | "chores" | "manual";
export type OwnedWorkSourceType =
  | "daily_bread"
  | "weekly_huddle"
  | "chore"
  | "animal"
  | "garden"
  | "pantry"
  | "preservation"
  | "manual";
export type StuckItemSourceType = "chores" | "animals" | "garden" | "pantry" | "preservation" | "daily_bread" | "manual";
export type DailyBreadSourceType =
  | "daily_bread"
  | "weekly_huddle"
  | "owned_work"
  | "chore"
  | "animal"
  | "garden"
  | "pantry"
  | "preservation"
  | "manual";

export interface SeasonPriority {
  id: string;
  title: string;
  ownerMemberId?: string;
  status: SeasonPriorityStatus;
  startDate?: string;
  targetDate?: string;
  notes?: string;
  linkedModule?: PriorityLinkedModule;
  createdAt: string;
  updatedAt: string;
}

export interface PulseMetric {
  id: string;
  title: string;
  value: string;
  target?: string;
  unit?: string;
  status: PulseMetricStatus;
  sourceType: HuddleModuleSource;
  sourceId?: string;
  weekStart?: string;
  notes?: string;
}

export interface OwnedWorkItem {
  id: string;
  title: string;
  ownerMemberId?: string;
  dueDate?: string;
  sourceType: OwnedWorkSourceType;
  sourceId?: string;
  status: OwnedWorkStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StuckItem {
  id: string;
  title: string;
  details?: string;
  sourceType: StuckItemSourceType;
  sourceId?: string;
  ownerMemberId?: string;
  status: StuckItemStatus;
  decision?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyBreadSelectedItem {
  sourceType: DailyBreadSourceType;
  sourceId?: string;
  title: string;
  ownerMemberId?: string;
  status: DailyBreadItemStatus;
  note?: string;
}

export interface DailyBreadEntry {
  id: string;
  date: string;
  householdNote?: string;
  gratitude?: string;
  prayerOrReflection?: string;
  todayFocus?: string;
  selectedItems: DailyBreadSelectedItem[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyHuddleEntry {
  id: string;
  weekStart: string;
  weekEnd: string;
  pulseReviewed: boolean;
  prioritiesReviewed: boolean;
  ownedWorkReviewed: boolean;
  stuckListReviewed: boolean;
  wins: string[];
  pulseNotes?: string;
  priorityNotes?: string;
  stuckItems: string[];
  decisions: string[];
  nextWeekFocus: string[];
  carryForwardItems: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HuddleData {
  seasonPriorities: SeasonPriority[];
  pulseMetrics: PulseMetric[];
  ownedWorkItems: OwnedWorkItem[];
  stuckItems: StuckItem[];
  dailyBreadEntries: DailyBreadEntry[];
  weeklyHuddleEntries: WeeklyHuddleEntry[];
}

export type SeasonPriorityInput = Omit<SeasonPriority, "id" | "createdAt" | "updatedAt">;
export type PulseMetricInput = Omit<PulseMetric, "id">;
export type OwnedWorkItemInput = Omit<OwnedWorkItem, "id" | "createdAt" | "updatedAt">;
export type StuckItemInput = Omit<StuckItem, "id" | "createdAt" | "updatedAt">;
export type DailyBreadEntryInput = Omit<DailyBreadEntry, "id" | "createdAt" | "updatedAt">;
export type WeeklyHuddleEntryInput = Omit<WeeklyHuddleEntry, "id" | "createdAt" | "updatedAt">;
