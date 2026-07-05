import type {
  ChoreDayBlock,
  ChoreEffort,
  ChoreLinkedEntityType,
  ChoreRecurrenceType,
  ChoreSkippedReason,
  ChoreStatus,
  ChoreVerification,
  ConditionType,
  FixedCadence,
  HouseholdMemberRole,
  SeasonAnchorType,
} from "./types";

export const MEMBER_ROLE_OPTIONS: Array<{ value: HouseholdMemberRole; label: string }> = [
  { value: "adult", label: "Adult" },
  { value: "teen", label: "Teen" },
  { value: "kid", label: "Kid" },
  { value: "other", label: "Other" },
];

export const MEMBER_COLORS = ["#294936", "#b85f3d", "#496f8a", "#a9792b", "#667b45", "#8f5a3f", "#6d6b8f", "#50796b"];

export const RECURRENCE_OPTIONS: Array<{ value: ChoreRecurrenceType; label: string; help: string }> = [
  { value: "fixed", label: "Fixed", help: "Daily, weekly, or monthly work." },
  { value: "decay", label: "Elapsed decay", help: "Gets ripe over time and resets when done." },
  { value: "condition", label: "Condition-based", help: "Manual weather or state signal." },
  { value: "season_anchor", label: "Season-anchored", help: "Offset from frost or a custom date." },
  { value: "burst", label: "Burst/project", help: "Checklist inside a date window." },
];

export const FIXED_CADENCE_OPTIONS: Array<{ value: FixedCadence; label: string }> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const BLOCK_OPTIONS: Array<{ value: ChoreDayBlock; label: string }> = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
  { value: "Anytime", label: "Anytime" },
];

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export const CONDITION_OPTIONS: Array<{ value: ConditionType; label: string }> = [
  { value: "no_rain", label: "No rain for N days" },
  { value: "frost_warning", label: "Frost warning placeholder" },
  { value: "manual_state", label: "Manual state/note" },
];

export const SEASON_ANCHOR_OPTIONS: Array<{ value: SeasonAnchorType; label: string }> = [
  { value: "first_frost", label: "First frost" },
  { value: "last_frost", label: "Last frost" },
  { value: "custom", label: "Custom season date" },
];

export const LINKED_ENTITY_OPTIONS: Array<{ value: ChoreLinkedEntityType; label: string }> = [
  { value: "animal", label: "Animal" },
  { value: "garden_bed", label: "Garden bed" },
  { value: "pantry", label: "Pantry" },
  { value: "preservation", label: "Preservation" },
  { value: "equipment_note", label: "Equipment note" },
  { value: "other", label: "Other" },
];

export const EFFORT_OPTIONS: Array<{ value: ChoreEffort; label: string }> = [
  { value: "S", label: "Small" },
  { value: "M", label: "Medium" },
  { value: "L", label: "Large" },
];

export const VERIFICATION_OPTIONS: Array<{ value: ChoreVerification; label: string }> = [
  { value: "trust", label: "Trust" },
  { value: "photo_optin", label: "Photo opt-in" },
];

export const STATUS_OPTIONS: Array<{ value: ChoreStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

export const SKIP_REASON_OPTIONS: Array<{ value: ChoreSkippedReason; label: string }> = [
  { value: "weather", label: "Weather" },
  { value: "away", label: "Away" },
  { value: "not_needed", label: "Not needed today" },
  { value: "broken", label: "Broken" },
  { value: "other", label: "Other" },
];

export function recurrenceTypeLabel(type: ChoreRecurrenceType): string {
  return RECURRENCE_OPTIONS.find((option) => option.value === type)?.label || type;
}

export function memberRoleLabel(role: HouseholdMemberRole): string {
  return MEMBER_ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
}

export function skipReasonLabel(reason?: ChoreSkippedReason): string {
  if (!reason) return "Skipped";
  return SKIP_REASON_OPTIONS.find((option) => option.value === reason)?.label || reason;
}

export function choreStatusLabel(status: ChoreStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
}

export interface ChoreTemplate {
  id: string;
  title: string;
  description: string;
  chores: Array<{
    title: string;
    recurrenceType: ChoreRecurrenceType;
    location?: string;
    effort: ChoreEffort;
    params: Record<string, unknown>;
    items?: string[];
    howWeDoIt?: string;
  }>;
}

export const SEASON_TEMPLATES: ChoreTemplate[] = [
  {
    id: "fall-prep",
    title: "Fall prep",
    description: "Frost-adjacent jobs that keep the place from getting surprised.",
    chores: [
      {
        title: "Stack firewood",
        recurrenceType: "season_anchor",
        location: "Wood shed",
        effort: "L",
        params: { anchor: "first_frost", offsetDays: -21, dueWindowDays: 14, block: "Anytime" },
        howWeDoIt: "Make the stack stable, dry, and close enough for the first cold week.",
      },
      {
        title: "Drain and store hoses",
        recurrenceType: "season_anchor",
        location: "Yard hydrants",
        effort: "M",
        params: { anchor: "first_frost", offsetDays: -7, dueWindowDays: 10, block: "PM" },
      },
      {
        title: "Check chimney and stove path",
        recurrenceType: "season_anchor",
        location: "House",
        effort: "M",
        params: { anchor: "first_frost", offsetDays: -30, dueWindowDays: 21, block: "Anytime" },
      },
    ],
  },
  {
    id: "spring-garden",
    title: "Spring garden setup",
    description: "Seed trays, beds, hoses, and hardening-off work around last frost.",
    chores: [
      {
        title: "Start tomato trays",
        recurrenceType: "season_anchor",
        location: "Seed table",
        effort: "M",
        params: { anchor: "last_frost", offsetDays: -49, dueWindowDays: 7, block: "Anytime" },
      },
      {
        title: "Open and check garden hoses",
        recurrenceType: "season_anchor",
        location: "Garden",
        effort: "M",
        params: { anchor: "last_frost", offsetDays: 7, dueWindowDays: 10, block: "Anytime" },
      },
      {
        title: "Prep first beds",
        recurrenceType: "season_anchor",
        location: "Garden",
        effort: "L",
        params: { anchor: "last_frost", offsetDays: -21, dueWindowDays: 14, block: "Anytime" },
      },
    ],
  },
  {
    id: "canning-weekend",
    title: "Canning weekend",
    description: "A tomato weekend checklist with owner-by-line support.",
    chores: [
      {
        title: "Canning weekend: tomatoes",
        recurrenceType: "burst",
        location: "Kitchen",
        effort: "L",
        params: { windowStart: "", windowEnd: "", block: "Anytime" },
        items: ["Clean jars", "Check lids and rings", "Prep sauce", "Process jars", "Move finished jars to Pantry"],
      },
    ],
  },
  {
    id: "butcher-day",
    title: "Butcher day",
    description: "A calm project checklist for one heavy work window.",
    chores: [
      {
        title: "Butcher day setup",
        recurrenceType: "burst",
        location: "Outdoor kitchen",
        effort: "L",
        params: { windowStart: "", windowEnd: "", block: "AM" },
        items: ["Sharpen knives", "Sanitize tables", "Stage coolers", "Label freezer bags", "Clean down work area"],
      },
    ],
  },
  {
    id: "winter-animal-care",
    title: "Winter animal care",
    description: "Cold-weather checks for water, feed, bedding, and mineral.",
    chores: [
      {
        title: "Check heated waterers",
        recurrenceType: "condition",
        location: "Barn",
        effort: "S",
        params: { conditionType: "frost_warning", thresholdDays: 0, isActive: false, conditionNote: "", block: "PM" },
      },
      {
        title: "Check mineral feeder",
        recurrenceType: "decay",
        location: "Barn",
        effort: "S",
        params: { intervalDays: 7, block: "Anytime" },
      },
      {
        title: "Deep bedding refresh",
        recurrenceType: "decay",
        location: "Barn",
        effort: "L",
        params: { intervalDays: 14, block: "AM" },
      },
    ],
  },
];
