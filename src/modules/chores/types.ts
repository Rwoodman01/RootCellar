export type HouseholdMemberRole = "adult" | "kid" | "teen" | "other";

export interface HouseholdMember {
  id: string;
  name: string;
  initials: string;
  role: HouseholdMemberRole;
  age?: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChoreRecurrenceType = "fixed" | "decay" | "condition" | "season_anchor" | "burst";
export type ChoreLinkedEntityType = "animal" | "garden_bed" | "pantry" | "preservation" | "equipment_note" | "other";
export type ChoreEffort = "S" | "M" | "L";
export type ChoreVerification = "trust" | "photo_optin";
export type ChoreStatus = "active" | "paused" | "archived";
export type ChoreAction = "completed" | "skipped";
export type ChoreSkippedReason = "weather" | "away" | "not_needed" | "broken" | "other";

export interface ChoreLinkedEntity {
  type: ChoreLinkedEntityType;
  id?: string;
  label?: string;
}

export type FixedCadence = "daily" | "weekly" | "monthly";
export type ChoreDayBlock = "AM" | "PM" | "Anytime";

export interface FixedRecurrenceParams {
  cadence: FixedCadence;
  daysOfWeek: number[];
  dayOfMonth: number;
  block: ChoreDayBlock;
  startDate: string;
}

export interface DecayRecurrenceParams {
  intervalDays: number;
  block: ChoreDayBlock;
}

export type ConditionType = "no_rain" | "frost_warning" | "manual_state";

export interface ConditionRecurrenceParams {
  conditionType: ConditionType;
  thresholdDays: number;
  isActive: boolean;
  conditionNote: string;
  block: ChoreDayBlock;
}

export type SeasonAnchorType = "first_frost" | "last_frost" | "custom";

export interface SeasonAnchorRecurrenceParams {
  anchor: SeasonAnchorType;
  offsetDays: number;
  customDate: string;
  dueWindowDays: number;
  block: ChoreDayBlock;
}

export interface BurstRecurrenceParams {
  windowStart: string;
  windowEnd: string;
  block: ChoreDayBlock;
}

export type ChoreRecurrenceParams =
  | FixedRecurrenceParams
  | DecayRecurrenceParams
  | ConditionRecurrenceParams
  | SeasonAnchorRecurrenceParams
  | BurstRecurrenceParams;

export interface Chore {
  id: string;
  title: string;
  ownerMemberId: string;
  backupMemberId?: string;
  recurrenceType: ChoreRecurrenceType;
  recurrenceParams: ChoreRecurrenceParams;
  linkedEntity?: ChoreLinkedEntity;
  location?: string;
  seasonWindow?: string;
  effort: ChoreEffort;
  minAge?: number;
  verification: ChoreVerification;
  howWeDoIt?: string;
  status: ChoreStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  memberId: string;
  completedAt: string;
  note?: string;
  photoPlaceholder?: string;
  skippedReason?: ChoreSkippedReason;
  action: ChoreAction;
}

export interface BurstChecklistItem {
  id: string;
  choreId: string;
  title: string;
  ownerMemberId: string;
  completedAt?: string;
  notes?: string;
}

export interface ChoreSettings {
  activeMemberId?: string;
  firstFrostDate: string;
  lastFrostDate: string;
  customSeasonDate: string;
  conditionState: {
    daysSinceRain: number;
    frostWarning: boolean;
    manualStateActive: boolean;
    manualStateNote: string;
  };
}

export interface ChoreData {
  members: HouseholdMember[];
  chores: Chore[];
  completions: ChoreCompletion[];
  burstItems: BurstChecklistItem[];
  settings: ChoreSettings;
}

export type HouseholdMemberInput = Omit<HouseholdMember, "id" | "createdAt" | "updatedAt">;
export type ChoreInput = Omit<Chore, "id" | "createdAt" | "updatedAt"> & {
  burstItems?: Array<Omit<BurstChecklistItem, "id" | "choreId" | "completedAt"> & { id?: string; completedAt?: string }>;
};
export type ChoreCompletionInput = Omit<ChoreCompletion, "id" | "completedAt"> & { completedAt?: string };
export type BurstChecklistItemInput = Omit<BurstChecklistItem, "id" | "choreId"> & { id?: string };

export interface ChoreUrgency {
  ratio: number;
  status: "not_due" | "ready_soon" | "ready" | "getting_ripe" | "done" | "stands_down";
  label: string;
  fill: number;
  dueDate?: string;
  daysElapsed?: number;
  daysUntilDue?: number;
  isDue: boolean;
  isDoneToday: boolean;
}

export interface ChoresByPerson {
  member?: HouseholdMember;
  chores: Chore[];
}

export interface CompletionStats {
  completedThisWeek: number;
  skippedThisWeek: number;
  byMember: Array<{
    member?: HouseholdMember;
    completed: number;
    skipped: number;
  }>;
}

export interface WeeklyChoreReview {
  byPersonLoad: Array<{
    member?: HouseholdMember;
    dueToday: number;
    activeOwned: number;
    readySoon: number;
  }>;
  unownedChores: Chore[];
  slippingChores: Chore[];
  skippedChores: ChoreCompletion[];
  upcomingSeasonChores: Array<{ chore: Chore; dueDate?: string; daysUntilDue?: number }>;
  burstProjects: Array<{ chore: Chore; completedItems: number; totalItems: number }>;
  fixItCandidates: Chore[];
  agendaItems: string[];
}
