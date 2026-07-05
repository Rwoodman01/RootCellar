import { DEFAULT_GARDEN_SETTINGS } from "../garden/constants";
import { BLOCK_OPTIONS, MEMBER_COLORS } from "./constants";
import type {
  BurstChecklistItem,
  Chore,
  ChoreData,
  ChoreDayBlock,
  ChoreEffort,
  ChoreLinkedEntity,
  ChoreLinkedEntityType,
  ChoreRecurrenceParams,
  ChoreRecurrenceType,
  ChoreSettings,
  ChoreSkippedReason,
  ChoreStatus,
  ChoreVerification,
  ConditionType,
  HouseholdMember,
  HouseholdMemberRole,
  SeasonAnchorType,
} from "./types";

const RECURRENCE_TYPES: ChoreRecurrenceType[] = ["fixed", "decay", "condition", "season_anchor", "burst"];
const MEMBER_ROLES: HouseholdMemberRole[] = ["adult", "kid", "teen", "other"];
const EFFORTS: ChoreEffort[] = ["S", "M", "L"];
const VERIFICATIONS: ChoreVerification[] = ["trust", "photo_optin"];
const STATUSES: ChoreStatus[] = ["active", "paused", "archived"];
const LINKED_ENTITY_TYPES: ChoreLinkedEntityType[] = ["animal", "garden_bed", "pantry", "preservation", "equipment_note", "other"];
const CONDITION_TYPES: ConditionType[] = ["no_rain", "frost_warning", "manual_state"];
const SEASON_ANCHORS: SeasonAnchorType[] = ["first_frost", "last_frost", "custom"];
const SKIP_REASONS: ChoreSkippedReason[] = ["weather", "away", "not_needed", "broken", "other"];

export function createEmptyChoreData(): ChoreData {
  return {
    members: [],
    chores: [],
    completions: [],
    burstItems: [],
    settings: createDefaultChoreSettings(),
  };
}

export function createDefaultChoreSettings(): ChoreSettings {
  return {
    firstFrostDate: DEFAULT_GARDEN_SETTINGS.firstFrostDate,
    lastFrostDate: DEFAULT_GARDEN_SETTINGS.lastFrostDate,
    customSeasonDate: `${new Date().getFullYear()}-09-01`,
    conditionState: {
      daysSinceRain: 0,
      frostWarning: false,
      manualStateActive: false,
      manualStateNote: "",
    },
  };
}

export function ensureChoreData(data?: Partial<ChoreData>): ChoreData {
  const settings = ensureSettings(data?.settings);
  const members = Array.isArray(data?.members) ? data.members.map(ensureMember) : [];
  const activeMemberExists = members.some((member) => member.id === settings.activeMemberId);
  return {
    members,
    chores: Array.isArray(data?.chores) ? data.chores.map(ensureChore) : [],
    completions: Array.isArray(data?.completions)
      ? data.completions.map((completion) => ({
          id: completion.id || "",
          choreId: completion.choreId || "",
          memberId: completion.memberId || "",
          completedAt: completion.completedAt || new Date().toISOString(),
          note: completion.note || "",
          photoPlaceholder: completion.photoPlaceholder || "",
          skippedReason: SKIP_REASONS.includes(completion.skippedReason as ChoreSkippedReason) ? completion.skippedReason : undefined,
          action: completion.action === "skipped" ? "skipped" : "completed",
        }))
      : [],
    burstItems: Array.isArray(data?.burstItems) ? data.burstItems.map(ensureBurstItem) : [],
    settings: {
      ...settings,
      activeMemberId: activeMemberExists ? settings.activeMemberId : members[0]?.id,
    },
  };
}

function ensureMember(member: Partial<HouseholdMember>): HouseholdMember {
  const now = new Date().toISOString();
  const name = member.name?.trim() || "Household member";
  return {
    id: member.id || "",
    name,
    initials: member.initials?.trim() || initialsFromName(name),
    role: MEMBER_ROLES.includes(member.role as HouseholdMemberRole) ? (member.role as HouseholdMemberRole) : "other",
    age: member.age === undefined || member.age === null ? undefined : Math.max(0, Number(member.age) || 0),
    color: member.color || MEMBER_COLORS[0],
    createdAt: member.createdAt || now,
    updatedAt: member.updatedAt || now,
  };
}

function ensureChore(chore: Partial<Chore>): Chore {
  const now = new Date().toISOString();
  const recurrenceType = RECURRENCE_TYPES.includes(chore.recurrenceType as ChoreRecurrenceType) ? (chore.recurrenceType as ChoreRecurrenceType) : "fixed";
  return {
    id: chore.id || "",
    title: chore.title?.trim() || "Untitled chore",
    ownerMemberId: chore.ownerMemberId || "",
    backupMemberId: chore.backupMemberId || undefined,
    recurrenceType,
    recurrenceParams: ensureRecurrenceParams(recurrenceType, chore.recurrenceParams),
    linkedEntity: ensureLinkedEntity(chore.linkedEntity),
    location: chore.location || "",
    seasonWindow: chore.seasonWindow || "",
    effort: EFFORTS.includes(chore.effort as ChoreEffort) ? (chore.effort as ChoreEffort) : "M",
    minAge: chore.minAge === undefined || chore.minAge === null ? undefined : Math.max(0, Number(chore.minAge) || 0),
    verification: VERIFICATIONS.includes(chore.verification as ChoreVerification) ? (chore.verification as ChoreVerification) : "trust",
    howWeDoIt: chore.howWeDoIt || "",
    status: STATUSES.includes(chore.status as ChoreStatus) ? (chore.status as ChoreStatus) : "active",
    createdAt: chore.createdAt || now,
    updatedAt: chore.updatedAt || now,
  };
}

function ensureRecurrenceParams(type: ChoreRecurrenceType, params?: Partial<ChoreRecurrenceParams>): ChoreRecurrenceParams {
  const raw = (params || {}) as Record<string, unknown>;
  const block = ensureBlock(raw.block);
  if (type === "decay") {
    const intervalDays = Number(raw.intervalDays ?? 10);
    return { intervalDays: Math.max(1, intervalDays || 10), block };
  }
  if (type === "condition") {
    const conditionType = CONDITION_TYPES.includes(raw.conditionType as ConditionType) ? (raw.conditionType as ConditionType) : "no_rain";
    return {
      conditionType,
      thresholdDays: Math.max(0, Number(raw.thresholdDays ?? 3) || 0),
      isActive: Boolean(raw.isActive ?? false),
      conditionNote: String(raw.conditionNote || ""),
      block,
    };
  }
  if (type === "season_anchor") {
    const anchor = SEASON_ANCHORS.includes(raw.anchor as SeasonAnchorType) ? (raw.anchor as SeasonAnchorType) : "first_frost";
    return {
      anchor,
      offsetDays: Number(raw.offsetDays ?? -21) || 0,
      customDate: String(raw.customDate || ""),
      dueWindowDays: Math.max(0, Number(raw.dueWindowDays ?? 14) || 0),
      block,
    };
  }
  if (type === "burst") {
    return {
      windowStart: String(raw.windowStart || todayDate()),
      windowEnd: String(raw.windowEnd || todayDate()),
      block,
    };
  }
  return {
    cadence: ["daily", "weekly", "monthly"].includes(String(raw.cadence)) ? (raw.cadence as "daily" | "weekly" | "monthly") : "daily",
    daysOfWeek: Array.isArray(raw.daysOfWeek) ? (raw.daysOfWeek as number[]).filter((day) => day >= 0 && day <= 6) : [],
    dayOfMonth: Math.min(31, Math.max(1, Number(raw.dayOfMonth ?? 1) || 1)),
    block,
    startDate: String(raw.startDate || todayDate()),
  };
}

function ensureLinkedEntity(entity?: Partial<ChoreLinkedEntity>): ChoreLinkedEntity | undefined {
  if (!entity?.type && !entity?.label && !entity?.id) return undefined;
  return {
    type: LINKED_ENTITY_TYPES.includes(entity.type as ChoreLinkedEntityType) ? (entity.type as ChoreLinkedEntityType) : "other",
    id: entity.id || undefined,
    label: entity.label || "",
  };
}

function ensureBurstItem(item: Partial<BurstChecklistItem>): BurstChecklistItem {
  return {
    id: item.id || "",
    choreId: item.choreId || "",
    title: item.title?.trim() || "Checklist item",
    ownerMemberId: item.ownerMemberId || "",
    completedAt: item.completedAt || undefined,
    notes: item.notes || "",
  };
}

function ensureSettings(settings?: Partial<ChoreSettings>): ChoreSettings {
  const defaults = createDefaultChoreSettings();
  return {
    activeMemberId: settings?.activeMemberId,
    firstFrostDate: settings?.firstFrostDate || defaults.firstFrostDate,
    lastFrostDate: settings?.lastFrostDate || defaults.lastFrostDate,
    customSeasonDate: settings?.customSeasonDate || defaults.customSeasonDate,
    conditionState: {
      daysSinceRain: Math.max(0, Number(settings?.conditionState?.daysSinceRain) || 0),
      frostWarning: Boolean(settings?.conditionState?.frostWarning),
      manualStateActive: Boolean(settings?.conditionState?.manualStateActive),
      manualStateNote: settings?.conditionState?.manualStateNote || "",
    },
  };
}

function ensureBlock(value: unknown): ChoreDayBlock {
  return BLOCK_OPTIONS.some((option) => option.value === value) ? (value as ChoreDayBlock) : "Anytime";
}

function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}` : words[0]?.slice(0, 2);
  return (initials || "HM").toUpperCase();
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
