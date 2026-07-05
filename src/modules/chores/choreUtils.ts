import { recurrenceTypeLabel, skipReasonLabel } from "./constants";
import type {
  BurstRecurrenceParams,
  Chore,
  ChoreCompletion,
  ChoreData,
  ChoreRecurrenceParams,
  ChoreUrgency,
  CompletionStats,
  ConditionRecurrenceParams,
  DecayRecurrenceParams,
  FixedRecurrenceParams,
  HouseholdMember,
  SeasonAnchorRecurrenceParams,
  WeeklyChoreReview,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(dateValue: string, days: number): string {
  const date = parseDate(dateValue) || new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

export function daysBetween(startValue: string, endValue: string): number {
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!start || !end) return 0;
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS);
}

export function getDueChores(data: ChoreData, date = todayDate()): Chore[] {
  return data.chores
    .filter((chore) => chore.status === "active")
    .filter((chore) => getChoreUrgency(chore, data.completions, date, data).isDue);
}

export function getTodayChores(data: ChoreData, date = todayDate()): Chore[] {
  return getDueChores(data, date);
}

export function getChoreUrgency(chore: Chore, completions: ChoreCompletion[], date = todayDate(), data?: ChoreData): ChoreUrgency {
  const doneToday = completionForDate(chore.id, completions, date);
  if (doneToday?.action === "completed") {
    return {
      ratio: 0,
      status: "done",
      label: "Done today",
      fill: 1,
      isDue: false,
      isDoneToday: true,
    };
  }
  if (doneToday?.action === "skipped") {
    return {
      ratio: 0,
      status: "stands_down",
      label: doneToday.skippedReason === "not_needed" ? "Not needed today" : "Stands down",
      fill: 0.2,
      isDue: false,
      isDoneToday: true,
    };
  }

  if (chore.status !== "active") {
    return {
      ratio: 0,
      status: "not_due",
      label: chore.status === "paused" ? "Paused" : "Archived",
      fill: 0,
      isDue: false,
      isDoneToday: false,
    };
  }

  if (chore.recurrenceType === "fixed") return fixedUrgency(chore, chore.recurrenceParams as FixedRecurrenceParams, date);
  if (chore.recurrenceType === "decay") return decayUrgency(chore, chore.recurrenceParams as DecayRecurrenceParams, completions, date);
  if (chore.recurrenceType === "condition") return conditionUrgency(chore.recurrenceParams as ConditionRecurrenceParams, data);
  if (chore.recurrenceType === "season_anchor") return seasonUrgency(chore, chore.recurrenceParams as SeasonAnchorRecurrenceParams, date, data);
  return burstUrgency(chore.recurrenceParams as BurstRecurrenceParams, date, data, chore);
}

export function getWeeklyChoreReview(data: ChoreData, date = todayDate()): WeeklyChoreReview {
  const dueToday = getTodayChores(data, date);
  const slippingChores = getSlippingChores(data, date);
  const unownedChores = getUnownedChores(data);
  const skippedChores = data.completions
    .filter((completion) => completion.action === "skipped")
    .filter((completion) => daysBetween(completion.completedAt.slice(0, 10), date) <= 7)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const upcomingSeasonChores = getUpcomingSeasonChores(data, date, 45);
  const burstProjects = data.chores
    .filter((chore) => chore.status === "active" && chore.recurrenceType === "burst")
    .filter((chore) => {
      const params = chore.recurrenceParams as BurstRecurrenceParams;
      return daysBetween(date, params.windowEnd) >= 0 && daysBetween(date, params.windowStart) <= 14;
    })
    .map((chore) => {
      const items = data.burstItems.filter((item) => item.choreId === chore.id);
      return { chore, completedItems: items.filter((item) => item.completedAt).length, totalItems: items.length };
    });
  const fixItCandidates = getFixItCandidates(data);
  const byPersonLoad = data.members.map((member) => {
    const ownedActive = data.chores.filter((chore) => chore.status === "active" && chore.ownerMemberId === member.id);
    return {
      member,
      dueToday: dueToday.filter((chore) => chore.ownerMemberId === member.id).length,
      activeOwned: ownedActive.length,
      readySoon: ownedActive.filter((chore) => {
        const urgency = getChoreUrgency(chore, data.completions, date, data);
        return urgency.status === "ready_soon" || urgency.status === "getting_ripe" || urgency.status === "ready";
      }).length,
    };
  });

  const agendaItems = [
    unownedChores.length ? `${unownedChores.length} chore${plural(unownedChores.length)} need an owner.` : "",
    slippingChores.length ? `${slippingChores.length} chore${plural(slippingChores.length)} keep slipping.` : "",
    skippedChores.length ? `${skippedChores.length} skip${plural(skippedChores.length)} logged this week.` : "",
    upcomingSeasonChores.length ? `${upcomingSeasonChores.length} seasonal chore${plural(upcomingSeasonChores.length)} coming in the next 45 days.` : "",
    fixItCandidates.length ? `${fixItCandidates.length} broken-skip pattern${plural(fixItCandidates.length)} could move to Fix-It later.` : "",
  ].filter(Boolean);

  return {
    byPersonLoad,
    unownedChores,
    slippingChores,
    skippedChores,
    upcomingSeasonChores,
    burstProjects,
    fixItCandidates,
    agendaItems,
  };
}

export function getChoresByPerson(data: ChoreData): Array<{ member?: HouseholdMember; chores: Chore[] }> {
  const known = data.members.map((member) => ({
    member,
    chores: data.chores.filter((chore) => chore.ownerMemberId === member.id && chore.status !== "archived"),
  }));
  const unowned = getUnownedChores(data).filter((chore) => chore.status !== "archived");
  return unowned.length ? [...known, { chores: unowned }] : known;
}

export function getSlippingChores(data: ChoreData, date = todayDate()): Chore[] {
  return data.chores
    .filter((chore) => chore.status === "active")
    .filter((chore) => {
      const urgency = getChoreUrgency(chore, data.completions, date, data);
      const recentSkips = data.completions.filter((completion) => completion.choreId === chore.id && completion.action === "skipped" && daysBetween(completion.completedAt.slice(0, 10), date) <= 21).length;
      return urgency.ratio > 1.2 || recentSkips >= 2;
    });
}

export function getUnownedChores(data: ChoreData): Chore[] {
  return data.chores.filter((chore) => chore.status !== "archived" && !data.members.some((member) => member.id === chore.ownerMemberId));
}

export function getCompletionStats(data: ChoreData, date = todayDate()): CompletionStats {
  const week = data.completions.filter((completion) => daysBetween(completion.completedAt.slice(0, 10), date) <= 7);
  return {
    completedThisWeek: week.filter((completion) => completion.action === "completed").length,
    skippedThisWeek: week.filter((completion) => completion.action === "skipped").length,
    byMember: data.members.map((member) => ({
      member,
      completed: week.filter((completion) => completion.memberId === member.id && completion.action === "completed").length,
      skipped: week.filter((completion) => completion.memberId === member.id && completion.action === "skipped").length,
    })),
  };
}

export function getUpcomingSeasonChores(data: ChoreData, date = todayDate(), withinDays = 45): Array<{ chore: Chore; dueDate?: string; daysUntilDue?: number }> {
  return data.chores
    .filter((chore) => chore.status === "active" && chore.recurrenceType === "season_anchor")
    .map((chore) => {
      const dueDate = resolveSeasonAnchorDate(chore.recurrenceParams as SeasonAnchorRecurrenceParams, data);
      const daysUntilDue = dueDate ? daysBetween(date, dueDate) : undefined;
      return { chore, dueDate, daysUntilDue };
    })
    .filter((entry) => entry.daysUntilDue !== undefined && entry.daysUntilDue >= 0 && entry.daysUntilDue <= withinDays)
    .sort((a, b) => (a.daysUntilDue || 0) - (b.daysUntilDue || 0));
}

export function getFixItCandidates(data: ChoreData): Chore[] {
  return data.chores.filter((chore) => {
    const brokenSkips = data.completions.filter((completion) => completion.choreId === chore.id && completion.action === "skipped" && completion.skippedReason === "broken");
    return brokenSkips.length >= 2;
  });
}

export function recurrenceSummary(chore: Chore, data?: ChoreData): string {
  const params = chore.recurrenceParams;
  if (chore.recurrenceType === "fixed") {
    const fixed = params as FixedRecurrenceParams;
    if (fixed.cadence === "weekly") return `Weekly ${fixed.daysOfWeek.length ? fixed.daysOfWeek.map(weekdayLabel).join(", ") : "from start date"} · ${fixed.block}`;
    if (fixed.cadence === "monthly") return `Monthly on day ${fixed.dayOfMonth} · ${fixed.block}`;
    return `Daily · ${fixed.block}`;
  }
  if (chore.recurrenceType === "decay") {
    const decay = params as DecayRecurrenceParams;
    return `Every ~${decay.intervalDays} day${plural(decay.intervalDays)} · ${decay.block}`;
  }
  if (chore.recurrenceType === "condition") {
    const condition = params as ConditionRecurrenceParams;
    if (condition.conditionType === "no_rain") return `When no rain for ${condition.thresholdDays} day${plural(condition.thresholdDays)} · ${condition.block}`;
    if (condition.conditionType === "frost_warning") return `When frost warning is on · ${condition.block}`;
    return `When manual condition is active · ${condition.block}`;
  }
  if (chore.recurrenceType === "season_anchor") {
    const season = params as SeasonAnchorRecurrenceParams;
    const due = data ? resolveSeasonAnchorDate(season, data) : undefined;
    const anchor = season.anchor === "first_frost" ? "first frost" : season.anchor === "last_frost" ? "last frost" : "custom date";
    const offset = season.offsetDays >= 0 ? `+${season.offsetDays}` : `${season.offsetDays}`;
    return `${anchor} ${offset} days${due ? ` · ${due}` : ""}`;
  }
  const burst = params as BurstRecurrenceParams;
  return `${recurrenceTypeLabel(chore.recurrenceType)} · ${burst.windowStart || "start"} to ${burst.windowEnd || "end"}`;
}

export function ownerLabel(chore: Chore, members: HouseholdMember[]): string {
  const member = members.find((entry) => entry.id === chore.ownerMemberId);
  return member ? `Owned by ${member.name}` : "Needs owner";
}

export function backupLabel(chore: Chore, members: HouseholdMember[]): string {
  const member = members.find((entry) => entry.id === chore.backupMemberId);
  return member ? `Backup: ${member.name}` : "No backup";
}

export function memberInitials(member?: HouseholdMember): string {
  return member?.initials || "?";
}

export function personName(member?: HouseholdMember): string {
  return member?.name || "Unowned";
}

export function completionLine(completion: ChoreCompletion, data: ChoreData): string {
  const member = data.members.find((entry) => entry.id === completion.memberId);
  const date = new Date(completion.completedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  if (completion.action === "skipped") return `${personName(member)} skipped · ${skipReasonLabel(completion.skippedReason)} · ${date}`;
  return `${personName(member)} completed · ${date}`;
}

function fixedUrgency(chore: Chore, params: FixedRecurrenceParams, date: string): ChoreUrgency {
  const due = isFixedDue(params, date);
  return {
    ratio: due ? 1 : 0,
    status: due ? "ready" : "not_due",
    label: due ? "Ready" : "Not today",
    fill: due ? 1 : 0.15,
    dueDate: due ? date : nextFixedDate(params, date),
    daysUntilDue: due ? 0 : daysBetween(date, nextFixedDate(params, date)),
    isDue: due,
    isDoneToday: false,
  };
}

function decayUrgency(chore: Chore, params: DecayRecurrenceParams, completions: ChoreCompletion[], date: string): ChoreUrgency {
  const lastCompleted = completions
    .filter((completion) => completion.choreId === chore.id && completion.action === "completed")
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  const baseDate = lastCompleted?.completedAt.slice(0, 10) || chore.createdAt.slice(0, 10);
  const elapsed = Math.max(0, daysBetween(baseDate, date));
  const ratio = elapsed / Math.max(1, params.intervalDays);
  const status = ratio >= 1.2 ? "getting_ripe" : ratio >= 1 ? "ready" : ratio >= 0.8 ? "ready_soon" : "not_due";
  const label = status === "getting_ripe" ? "Getting ripe" : status === "ready" ? "Ready" : status === "ready_soon" ? "Ready soon" : "Not ripe yet";
  return {
    ratio,
    status,
    label,
    fill: Math.min(1, ratio / 1.2),
    daysElapsed: elapsed,
    dueDate: addDays(baseDate, Math.ceil(params.intervalDays * 0.8)),
    daysUntilDue: Math.max(0, Math.ceil(params.intervalDays * 0.8) - elapsed),
    isDue: ratio >= 0.8,
    isDoneToday: false,
  };
}

function conditionUrgency(params: ConditionRecurrenceParams, data?: ChoreData): ChoreUrgency {
  const state = data?.settings.conditionState;
  const active =
    params.conditionType === "no_rain"
      ? (state?.daysSinceRain || 0) >= params.thresholdDays
      : params.conditionType === "frost_warning"
        ? Boolean(state?.frostWarning)
        : params.isActive || Boolean(state?.manualStateActive);
  const note = params.conditionType === "no_rain" ? `${state?.daysSinceRain || 0}/${params.thresholdDays} dry days` : params.conditionType === "frost_warning" ? "Frost warning placeholder" : params.conditionNote || state?.manualStateNote || "Manual condition";
  return {
    ratio: active ? 1 : 0,
    status: active ? "ready" : "not_due",
    label: active ? "Ready" : "Stands down",
    fill: active ? 1 : 0.2,
    isDue: active,
    isDoneToday: false,
    daysElapsed: params.conditionType === "no_rain" ? state?.daysSinceRain || 0 : undefined,
    dueDate: note,
  };
}

function seasonUrgency(chore: Chore, params: SeasonAnchorRecurrenceParams, date: string, data?: ChoreData): ChoreUrgency {
  const dueDate = data ? resolveSeasonAnchorDate(params, data) : params.customDate;
  if (!dueDate) {
    return {
      ratio: 0,
      status: "not_due",
      label: "Needs season date",
      fill: 0,
      isDue: false,
      isDoneToday: false,
    };
  }
  const daysUntilDue = daysBetween(date, dueDate);
  const windowStart = addDays(dueDate, -params.dueWindowDays);
  const inWindow = daysBetween(windowStart, date) >= 0;
  const pastDue = daysUntilDue <= 0;
  const ratio = pastDue ? 1 : inWindow ? 1 - Math.max(0, daysUntilDue) / Math.max(1, params.dueWindowDays) : 0;
  const currentYearDone = data?.completions.some((completion) => completion.choreId === chore.id && completion.action === "completed" && completion.completedAt.slice(0, 4) === date.slice(0, 4));
  const status = currentYearDone ? "done" : pastDue ? "ready" : inWindow ? "ready_soon" : "not_due";
  return {
    ratio,
    status,
    label: currentYearDone ? "Done this season" : pastDue ? "Ready" : inWindow ? "Ready soon" : "Seasonal later",
    fill: Math.min(1, Math.max(0.12, ratio)),
    dueDate,
    daysUntilDue,
    isDue: !currentYearDone && (pastDue || inWindow),
    isDoneToday: false,
  };
}

function burstUrgency(params: BurstRecurrenceParams, date: string, data?: ChoreData, chore?: Chore): ChoreUrgency {
  const startsIn = daysBetween(date, params.windowStart);
  const endsIn = daysBetween(date, params.windowEnd);
  const activeWindow = startsIn <= 0 && endsIn >= 0;
  const comingSoon = startsIn > 0 && startsIn <= 14;
  const items = chore && data ? data.burstItems.filter((item) => item.choreId === chore.id) : [];
  const total = items.length;
  const done = items.filter((item) => item.completedAt).length;
  const complete = total > 0 && done === total;
  return {
    ratio: total ? done / total : activeWindow ? 1 : 0,
    status: complete ? "done" : activeWindow ? "ready" : comingSoon ? "ready_soon" : "not_due",
    label: complete ? "Checklist done" : activeWindow ? "In window" : comingSoon ? "Ready soon" : "Project later",
    fill: total ? done / total : activeWindow ? 1 : 0.2,
    dueDate: params.windowStart,
    daysUntilDue: startsIn,
    isDue: !complete && activeWindow,
    isDoneToday: false,
  };
}

function resolveSeasonAnchorDate(params: SeasonAnchorRecurrenceParams, data: ChoreData): string | undefined {
  const anchorDate = params.anchor === "first_frost" ? data.settings.firstFrostDate : params.anchor === "last_frost" ? data.settings.lastFrostDate : params.customDate || data.settings.customSeasonDate;
  if (!anchorDate) return undefined;
  return addDays(anchorDate, params.offsetDays);
}

function isFixedDue(params: FixedRecurrenceParams, date: string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;
  if (params.startDate && daysBetween(params.startDate, date) < 0) return false;
  if (params.cadence === "daily") return true;
  if (params.cadence === "weekly") {
    const selected = params.daysOfWeek.length ? params.daysOfWeek : [parseDate(params.startDate)?.getDay() ?? 0];
    return selected.includes(parsed.getDay());
  }
  return parsed.getDate() === params.dayOfMonth;
}

function nextFixedDate(params: FixedRecurrenceParams, date: string): string {
  for (let offset = 0; offset <= 366; offset += 1) {
    const candidate = addDays(date, offset);
    if (isFixedDue(params, candidate)) return candidate;
  }
  return date;
}

function completionForDate(choreId: string, completions: ChoreCompletion[], date: string): ChoreCompletion | undefined {
  return completions
    .filter((completion) => completion.choreId === choreId && completion.completedAt.slice(0, 10) === date)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
}

function weekdayLabel(day: number): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day] || "Day";
}

function plural(count: number): string {
  return count === 1 ? "" : "s";
}
