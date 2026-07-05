import type { AnimalData } from "../animals/types";
import { dueCareReminders, dueFollowUps, targetLabel } from "../animals/animalUtils";
import type { ChoreData } from "../chores/types";
import { getCompletionStats, getSlippingChores, getTodayChores, getUnownedChores, getWeeklyChoreReview } from "../chores/choreUtils";
import type { GardenData } from "../garden/types";
import { plantingLabel } from "../garden/gardenUtils";
import type { PantryData } from "../pantry/types";
import { getLowStockProducts, getProductTotal, getUseSoonBatches } from "../pantry/pantryUtils";
import type { PreservationPlan } from "../preservation/types";
import type { DailyBreadSelectedItem, HuddleData, HuddleModuleSource, PulseMetricStatus } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DailyBreadSourceItem extends DailyBreadSelectedItem {
  group: "owned" | "chores" | "animals" | "garden" | "pantry" | "preservation" | "carry";
  detail: string;
  dueDate?: string;
  href?: string;
}

export interface PulseSnapshot {
  id: string;
  title: string;
  value: string;
  target?: string;
  unit?: string;
  status: PulseMetricStatus;
  sourceType: HuddleModuleSource;
  notes?: string;
}

export interface WeeklySignal {
  id: string;
  title: string;
  detail: string;
  sourceType: HuddleModuleSource;
  status: PulseMetricStatus;
  href?: string;
}

interface RhythmSourceData {
  huddle: HuddleData;
  chores: ChoreData;
  animals: AnimalData;
  garden: GardenData;
  pantry: PantryData;
  preservationPlans: PreservationPlan[];
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(dateValue: string, days: number): string {
  const date = parseDate(dateValue) || new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

export function getWeekRange(dateValue = todayDate()): { weekStart: string; weekEnd: string } {
  const date = parseDate(dateValue) || new Date();
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  const weekStart = isoDate(date);
  const weekEnd = addDays(weekStart, 6);
  return { weekStart, weekEnd };
}

export function getDailyBreadItems(source: RhythmSourceData, date = todayDate()): DailyBreadSourceItem[] {
  const todayChores = getTodayChores(source.chores, date).map<DailyBreadSourceItem>((chore) => ({
    sourceType: "chore",
    sourceId: chore.id,
    title: chore.title,
    ownerMemberId: chore.ownerMemberId,
    status: "open",
    group: "chores",
    detail: chore.location || "Chore due today",
    dueDate: date,
    href: `/chores/${chore.id}`,
  }));

  const animalCare = [
    ...dueCareReminders(source.animals.careReminders, date).map<DailyBreadSourceItem>((reminder) => ({
      sourceType: "animal",
      sourceId: reminder.id,
      title: reminder.title,
      status: "open",
      group: "animals",
      detail: `${targetLabel(source.animals, reminder)} care is due`,
      dueDate: reminder.nextDueDate,
      href: "/animals/reminders",
    })),
    ...dueFollowUps(source.animals.events, date).map<DailyBreadSourceItem>((event) => ({
      sourceType: "animal",
      sourceId: event.id,
      title: `Follow up: ${targetLabel(source.animals, event)}`,
      status: "open",
      group: "animals",
      detail: event.notes || "Animal follow-up is due",
      dueDate: event.followUpDate,
      href: "/animals/timeline",
    })),
  ];

  const gardenWork = getGardenDailyItems(source.garden, date);
  const pantryWork = getUseSoonBatches(source.pantry, 14)
    .slice(0, 5)
    .map<DailyBreadSourceItem>((batch) => {
      const product = source.pantry.products.find((entry) => entry.id === batch.productId);
      return {
        sourceType: "pantry",
        sourceId: batch.id,
        title: `Use soon: ${product?.name || "Pantry batch"}`,
        status: "open",
        group: "pantry",
        detail: batch.eatByDate ? `Best by ${batch.eatByDate}` : `${batch.quantity} ${batch.unit} left`,
        dueDate: batch.eatByDate,
        href: product ? `/pantry/products/${product.id}` : "/pantry/eat-first",
      };
    });

  const preservationWork = source.preservationPlans.flatMap((plan) =>
    plan.sessions
      .filter((session) => session.date && session.date <= date && daysBetween(session.date, date) <= 7)
      .map<DailyBreadSourceItem>((session) => ({
        sourceType: "preservation",
        sourceId: session.id,
        title: session.title,
        status: "open",
        group: "preservation",
        detail: `${plan.title}${session.date < date ? " slipped from " + session.date : ""}`,
        dueDate: session.date,
        href: `/preservation/${plan.id}`,
      })),
  );

  const carryForward = source.huddle.ownedWorkItems
    .filter((item) => (item.status === "open" || item.status === "carried") && (!item.dueDate || item.dueDate <= date))
    .map<DailyBreadSourceItem>((item) => ({
      sourceType: "owned_work",
      sourceId: item.id,
      title: item.title,
      ownerMemberId: item.ownerMemberId,
      status: "open",
      group: "carry",
      detail: item.dueDate ? `Due ${item.dueDate}` : item.notes || "Carry-forward work",
      dueDate: item.dueDate,
    }));

  return [...carryForward, ...todayChores, ...animalCare, ...gardenWork, ...pantryWork, ...preservationWork];
}

export function mergeDailyBreadStatuses(items: DailyBreadSourceItem[], selectedItems: DailyBreadSelectedItem[] = []): DailyBreadSourceItem[] {
  const selected = new Map(selectedItems.map((item) => [dailyItemKey(item), item]));
  return items.map((item) => {
    const saved = selected.get(dailyItemKey(item));
    return saved ? { ...item, ...saved, group: item.group, detail: item.detail, dueDate: item.dueDate, href: item.href } : item;
  });
}

export function dailyItemKey(item: Pick<DailyBreadSelectedItem, "sourceType" | "sourceId" | "title">): string {
  return `${item.sourceType}:${item.sourceId || item.title}`;
}

export function getPulseSnapshots(source: RhythmSourceData, weekStart = getWeekRange().weekStart): PulseSnapshot[] {
  const choreStats = getCompletionStats(source.chores);
  const dueToday = getTodayChores(source.chores).length;
  const slippingChores = getSlippingChores(source.chores).length;
  const lowStock = getLowStockProducts(source.pantry).length;
  const useSoon = getUseSoonBatches(source.pantry).length;
  const animalCareDue = dueCareReminders(source.animals.careReminders).length + dueFollowUps(source.animals.events).length;
  const openTargets = source.garden.targets.length;
  const upcomingSessions = source.preservationPlans.reduce(
    (sum, plan) => sum + plan.sessions.filter((session) => session.date >= weekStart && session.date <= addDays(weekStart, 13)).length,
    0,
  );

  const automatic: PulseSnapshot[] = [
    {
      id: "auto-chores",
      title: "Chores due today",
      value: String(dueToday),
      status: dueToday > 8 ? "needs_attention" : dueToday > 3 ? "watch" : "good",
      sourceType: "chores",
      notes: `${choreStats.completedThisWeek} done and ${choreStats.skippedThisWeek} stood down this week`,
    },
    {
      id: "auto-slipping",
      title: "Slipping work",
      value: String(slippingChores),
      status: slippingChores > 2 ? "needs_attention" : slippingChores > 0 ? "watch" : "good",
      sourceType: "chores",
    },
    {
      id: "auto-pantry",
      title: "Pantry watch",
      value: String(lowStock + useSoon),
      status: lowStock + useSoon > 6 ? "needs_attention" : lowStock + useSoon > 0 ? "watch" : "good",
      sourceType: "pantry",
      notes: `${lowStock} low stock, ${useSoon} use soon`,
    },
    {
      id: "auto-animals",
      title: "Animal care due",
      value: String(animalCareDue),
      status: animalCareDue > 3 ? "needs_attention" : animalCareDue > 0 ? "watch" : "good",
      sourceType: "animals",
    },
    {
      id: "auto-garden",
      title: "Garden targets",
      value: String(openTargets),
      status: openTargets ? "watch" : "good",
      sourceType: "garden",
      notes: source.garden.plantings.length ? `${source.garden.plantings.length} plantings tracked` : "No plantings yet",
    },
    {
      id: "auto-preservation",
      title: "Preservation sessions",
      value: String(upcomingSessions),
      status: upcomingSessions ? "watch" : "good",
      sourceType: "preservation",
      notes: "Next two weeks",
    },
  ];

  const manual = source.huddle.pulseMetrics
    .filter((metric) => !metric.weekStart || metric.weekStart === weekStart)
    .map<PulseSnapshot>((metric) => ({
      id: metric.id,
      title: metric.title,
      value: metric.value,
      target: metric.target,
      unit: metric.unit,
      status: metric.status,
      sourceType: metric.sourceType,
      notes: metric.notes,
    }));

  return [...automatic, ...manual];
}

export function getWeeklySignals(source: RhythmSourceData, date = todayDate()): WeeklySignal[] {
  const review = getWeeklyChoreReview(source.chores, date);
  const lowStock = getLowStockProducts(source.pantry);
  const useSoon = getUseSoonBatches(source.pantry, 30);
  const animalCare = dueCareReminders(source.animals.careReminders, date);
  const animalFollowUps = dueFollowUps(source.animals.events, date);
  const preservationSlips = source.preservationPlans.flatMap((plan) =>
    plan.sessions
      .filter((session) => session.date && session.date < date && daysBetween(session.date, date) <= 21)
      .map<WeeklySignal>((session) => ({
        id: `preservation-${session.id}`,
        title: session.title,
        detail: `${plan.title} slipped from ${session.date}`,
        sourceType: "preservation",
        status: "watch",
        href: `/preservation/${plan.id}`,
      })),
  );
  const gardenSignals = source.garden.targets.slice(0, 5).map<WeeklySignal>((target) => ({
    id: `garden-target-${target.id}`,
    title: target.cropProduct,
    detail: `${target.estimatedPlantsNeeded} plants or ${target.estimatedRowFeetNeeded} row feet planned`,
    sourceType: "garden",
    status: "watch",
    href: "/garden/targets",
  }));

  return [
    ...review.unownedChores.map<WeeklySignal>((chore) => ({
      id: `chore-unowned-${chore.id}`,
      title: chore.title,
      detail: "Needs an owner",
      sourceType: "chores",
      status: "needs_attention",
      href: `/chores/${chore.id}`,
    })),
    ...review.slippingChores.map<WeeklySignal>((chore) => ({
      id: `chore-slip-${chore.id}`,
      title: chore.title,
      detail: "This work keeps slipping",
      sourceType: "chores",
      status: "watch",
      href: `/chores/${chore.id}`,
    })),
    ...lowStock.slice(0, 5).map<WeeklySignal>((product) => ({
      id: `pantry-low-${product.id}`,
      title: product.name,
      detail: `${getProductTotal(product.id, source.pantry.batches)} on hand; threshold ${product.lowStockThreshold}`,
      sourceType: "pantry",
      status: "needs_attention",
      href: `/pantry/products/${product.id}`,
    })),
    ...useSoon.slice(0, 5).map<WeeklySignal>((batch) => {
      const product = source.pantry.products.find((entry) => entry.id === batch.productId);
      return {
        id: `pantry-soon-${batch.id}`,
        title: product?.name || "Pantry batch",
        detail: batch.eatByDate ? `Use by ${batch.eatByDate}` : "Use soon",
        sourceType: "pantry",
        status: "watch",
        href: product ? `/pantry/products/${product.id}` : "/pantry/eat-first",
      };
    }),
    ...animalCare.map<WeeklySignal>((reminder) => ({
      id: `animal-care-${reminder.id}`,
      title: reminder.title,
      detail: `${targetLabel(source.animals, reminder)} needs care`,
      sourceType: "animals",
      status: "needs_attention",
      href: "/animals/reminders",
    })),
    ...animalFollowUps.map<WeeklySignal>((event) => ({
      id: `animal-follow-${event.id}`,
      title: `Follow up: ${targetLabel(source.animals, event)}`,
      detail: event.notes || "Animal follow-up is due",
      sourceType: "animals",
      status: "watch",
      href: "/animals/timeline",
    })),
    ...gardenSignals,
    ...preservationSlips,
  ];
}

function getGardenDailyItems(garden: GardenData, date: string): DailyBreadSourceItem[] {
  const datedPlantingWork = garden.plantings.flatMap((planting) => {
    const label = plantingLabel(planting, garden.varieties);
    return [
      planting.startedIndoorsDate === date
        ? {
            sourceType: "garden" as const,
            sourceId: `${planting.id}:start`,
            title: `Start indoors: ${label}`,
            status: "open" as const,
            group: "garden" as const,
            detail: "Seed starting date",
            dueDate: date,
            href: "/garden/plantings",
          }
        : null,
      planting.transplantedDate === date
        ? {
            sourceType: "garden" as const,
            sourceId: `${planting.id}:transplant`,
            title: `Transplant: ${label}`,
            status: "open" as const,
            group: "garden" as const,
            detail: "Transplant date",
            dueDate: date,
            href: "/garden/plantings",
          }
        : null,
      planting.directSownDate === date
        ? {
            sourceType: "garden" as const,
            sourceId: `${planting.id}:sow`,
            title: `Direct sow: ${label}`,
            status: "open" as const,
            group: "garden" as const,
            detail: "Direct sow date",
            dueDate: date,
            href: "/garden/plantings",
          }
        : null,
      planting.firstHarvestDate && planting.firstHarvestDate <= date && (!planting.lastHarvestDate || planting.lastHarvestDate >= date)
        ? {
            sourceType: "garden" as const,
            sourceId: `${planting.id}:harvest`,
            title: `Harvest check: ${label}`,
            status: "open" as const,
            group: "garden" as const,
            detail: "Inside harvest window",
            dueDate: date,
            href: "/garden/harvests",
          }
        : null,
    ].filter(Boolean);
  });

  const targetWork = garden.targets
    .filter((target) => Object.values(target.suggestedDates).some((value) => value && value <= date))
    .slice(0, 4)
    .map<DailyBreadSourceItem>((target) => ({
      sourceType: "garden",
      sourceId: target.id,
      title: `Garden target: ${target.cropProduct}`,
      status: "open",
      group: "garden",
      detail: `${target.estimatedPlantsNeeded} plants or ${target.estimatedRowFeetNeeded} row feet`,
      dueDate: date,
      href: "/garden/targets",
    }));

  return [...datedPlantingWork, ...targetWork] as DailyBreadSourceItem[];
}

function parseDate(dateValue?: string): Date | null {
  if (!dateValue) return null;
  const date = new Date(`${dateValue.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(startValue: string, endValue: string): number {
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!start || !end) return 0;
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS);
}
