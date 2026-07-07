import type { RootcellarLocalData } from "./rootcellarStorage";
import { loadRootcellarData, saveRootcellarData } from "./rootcellarStorage";
import type { HouseholdMember } from "../../modules/chores/types";
import type { Chore } from "../../modules/chores/types";
import type { PantryLocation, PantryProduct, PantryBatch } from "../../modules/pantry/types";
import type { Bed, Planting, GardenTarget } from "../../modules/garden/types";
import type { AnimalGroup, CareReminder } from "../../modules/animals/types";
import type { PreservationPlan } from "../../modules/preservation/types";
import type { DailyBreadEntry, WeeklyHuddleEntry, SeasonPriority } from "../../modules/huddle/types";
import { getWeekRange, todayDate } from "../../modules/huddle/rhythmUtils";

export const SAMPLE_ID_PREFIX = "sample_";

function isSampleId(id: string): boolean {
  return id.startsWith(SAMPLE_ID_PREFIX);
}

function stripSampleRecords(data: RootcellarLocalData): RootcellarLocalData {
  return {
    ...data,
    chores: {
      ...data.chores,
      members: data.chores.members.filter((member) => !isSampleId(member.id)),
      chores: data.chores.chores.filter((chore) => !isSampleId(chore.id)),
      settings: {
        ...data.chores.settings,
        activeMemberId: data.chores.settings.activeMemberId && isSampleId(data.chores.settings.activeMemberId) ? undefined : data.chores.settings.activeMemberId,
      },
    },
    pantry: {
      ...data.pantry,
      products: data.pantry.products.filter((product) => !isSampleId(product.id)),
      batches: data.pantry.batches.filter((batch) => !isSampleId(batch.id)),
      locations: data.pantry.locations.filter((location) => !isSampleId(location.id)),
    },
    garden: {
      ...data.garden,
      beds: data.garden.beds.filter((bed) => !isSampleId(bed.id)),
      plantings: data.garden.plantings.filter((planting) => !isSampleId(planting.id)),
      targets: data.garden.targets.filter((target) => !isSampleId(target.id)),
    },
    animals: {
      ...data.animals,
      groups: data.animals.groups.filter((group) => !isSampleId(group.id)),
      careReminders: data.animals.careReminders.filter((reminder) => !isSampleId(reminder.id)),
    },
    preservationPlans: data.preservationPlans.filter((plan) => !isSampleId(plan.id)),
    huddle: {
      ...data.huddle,
      seasonPriorities: data.huddle.seasonPriorities.filter((priority) => !isSampleId(priority.id)),
      dailyBreadEntries: data.huddle.dailyBreadEntries.filter((entry) => !isSampleId(entry.id)),
      weeklyHuddleEntries: data.huddle.weeklyHuddleEntries.filter((entry) => !isSampleId(entry.id)),
    },
    onboarding: {
      ...data.onboarding,
      sampleDataLoaded: false,
    },
  };
}

export function buildSampleHomestead(base: RootcellarLocalData, now: string): RootcellarLocalData {
  const data = stripSampleRecords(base);
  const today = todayDate();
  const { weekStart, weekEnd } = getWeekRange(today);

  const june: HouseholdMember = {
    id: "sample_member_june",
    name: "June",
    initials: "JN",
    role: "adult",
    color: "#294936",
    createdAt: now,
    updatedAt: now,
  };
  const sam: HouseholdMember = {
    id: "sample_member_sam",
    name: "Sam",
    initials: "SM",
    role: "kid",
    color: "#b85f3d",
    createdAt: now,
    updatedAt: now,
  };

  const chores: Chore[] = [
    {
      id: "sample_chore_hens_am",
      title: "Feed and water the hens",
      ownerMemberId: june.id,
      recurrenceType: "fixed",
      recurrenceParams: { cadence: "daily", daysOfWeek: [], dayOfMonth: 1, block: "AM", startDate: today },
      location: "Coop",
      effort: "S",
      verification: "trust",
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sample_chore_coop_deep_clean",
      title: "Deep-clean the coop",
      ownerMemberId: sam.id,
      recurrenceType: "decay",
      recurrenceParams: { intervalDays: 14, block: "Anytime" },
      location: "Coop",
      effort: "M",
      verification: "trust",
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sample_chore_drain_hoses",
      title: "Drain hoses before frost",
      ownerMemberId: june.id,
      recurrenceType: "season_anchor",
      recurrenceParams: { anchor: "first_frost", offsetDays: -7, customDate: "", dueWindowDays: 14, block: "PM" },
      location: "Yard hydrants",
      effort: "M",
      verification: "trust",
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const basementShelves: PantryLocation = { id: "sample_loc_basement", name: "Basement shelves", notes: "", createdAt: now, updatedAt: now };
  const chestFreezer: PantryLocation = { id: "sample_loc_freezer", name: "Chest freezer", notes: "", createdAt: now, updatedAt: now };

  const tomatoSauce: PantryProduct = {
    id: "sample_product_tomato_sauce",
    name: "Tomato sauce",
    category: "jars-canned",
    defaultRotationMonths: 18,
    lowStockThreshold: 4,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  const greenBeans: PantryProduct = {
    id: "sample_product_green_beans",
    name: "Frozen green beans",
    category: "freezer",
    defaultRotationMonths: 9,
    lowStockThreshold: 3,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  const oats: PantryProduct = {
    id: "sample_product_oats",
    name: "Rolled oats",
    category: "dry-bulk",
    defaultRotationMonths: 24,
    lowStockThreshold: 2,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };

  const batches: PantryBatch[] = [
    {
      id: "sample_batch_tomato_sauce",
      productId: tomatoSauce.id,
      batchCode: "2026-A",
      quantity: 12,
      unit: "quarts",
      originalQuantity: 12,
      dateAdded: today,
      locationId: basementShelves.id,
      sourceType: "manual",
      method: "water-bath",
      notes: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sample_batch_green_beans",
      productId: greenBeans.id,
      batchCode: "2026-B",
      quantity: 6,
      unit: "bags",
      originalQuantity: 6,
      dateAdded: today,
      locationId: chestFreezer.id,
      sourceType: "manual",
      method: "frozen",
      notes: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sample_batch_oats",
      productId: oats.id,
      batchCode: "2026-C",
      quantity: 20,
      unit: "pounds",
      originalQuantity: 20,
      dateAdded: today,
      locationId: basementShelves.id,
      sourceType: "manual",
      method: "other",
      notes: "",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const northBed: Bed = {
    id: "sample_bed_north",
    name: "North bed",
    areaName: "Main garden",
    planningMode: "row-feet",
    lengthFeet: 20,
    widthFeet: 4,
    rowFeetCapacity: 20,
    sun: "full-sun",
    soilNotes: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  const kitchenBed: Bed = {
    id: "sample_bed_kitchen",
    name: "Kitchen bed",
    areaName: "Near the house",
    planningMode: "row-feet",
    lengthFeet: 8,
    widthFeet: 3,
    rowFeetCapacity: 8,
    sun: "part-sun",
    soilNotes: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };

  const plantings: Planting[] = [
    {
      id: "sample_planting_tomatoes",
      crop: "Tomato",
      bedId: northBed.id,
      quantity: 6,
      quantityUnit: "plants",
      rowFeet: 12,
      squareFeet: 12,
      bedPosition: 0,
      outcomeRating: 0,
      notes: "",
      photoPlaceholder: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sample_planting_lettuce",
      crop: "Lettuce",
      bedId: kitchenBed.id,
      quantity: 12,
      quantityUnit: "plants",
      rowFeet: 4,
      squareFeet: 4,
      bedPosition: 0,
      outcomeRating: 0,
      notes: "",
      photoPlaceholder: "",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const target: GardenTarget = {
    id: "sample_target_tomatoes",
    source: "manual",
    cropProduct: "Tomatoes",
    targetUnits: 24,
    targetUnitLabel: "quarts",
    estimatedPoundsNeeded: 72,
    estimatedPlantsNeeded: 6,
    estimatedRowFeetNeeded: 12,
    suggestedBedIds: [northBed.id],
    suggestedDates: {},
    assumptionsUsed: [],
    createdAt: now,
    updatedAt: now,
  };

  const layingFlock: AnimalGroup = {
    id: "sample_group_laying_flock",
    name: "Laying flock",
    species: "Chicken",
    purpose: "eggs",
    count: 8,
    location: "Coop",
    startDate: today,
    status: "active",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };

  const careReminder: CareReminder = {
    id: "sample_reminder_waterer",
    title: "Check waterer",
    groupId: layingFlock.id,
    suggestedCadence: "Daily",
    nextDueDate: today,
    notes: "",
    choreIntegrationStatus: "placeholder",
    createdAt: now,
    updatedAt: now,
  };

  const preservationPlan: PreservationPlan = {
    id: "sample_plan_tomato_season",
    title: "Sample: Tomato season",
    householdName: data.householdProfile.householdName,
    seasonYear: new Date().getFullYear(),
    notes: "",
    items: [
      {
        id: "sample_item_crushed_tomatoes",
        productType: "crushed-tomatoes",
        method: "water-bath-canning",
        targetQuantity: 24,
        unit: "quart-jars",
        notes: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "sample_item_freezer_vegetables",
        productType: "freezer-vegetables",
        method: "freezing",
        targetQuantity: 10,
        unit: "freezer-bags",
        notes: "",
        createdAt: now,
        updatedAt: now,
      },
    ],
    sessions: [],
    createdAt: now,
    updatedAt: now,
  };

  const dailyBreadEntry: DailyBreadEntry = {
    id: "sample_daily_bread_entry",
    date: today,
    householdNote: "First week with Rootcellar keeping track.",
    gratitude: "The hens are laying well this week.",
    todayFocus: "Get the tomato sauce shelved.",
    selectedItems: [],
    createdAt: now,
    updatedAt: now,
  };

  const weeklyHuddleEntry: WeeklyHuddleEntry = {
    id: "sample_weekly_huddle_entry",
    weekStart,
    weekEnd,
    pulseReviewed: false,
    prioritiesReviewed: false,
    ownedWorkReviewed: false,
    stuckListReviewed: false,
    wins: ["Put up 12 quarts of tomato sauce"],
    stuckItems: [],
    decisions: [],
    nextWeekFocus: ["Plan the fall bed cleanup"],
    carryForwardItems: [],
    createdAt: now,
    updatedAt: now,
  };

  const seasonPriority: SeasonPriority = {
    id: "sample_priority_tomatoes",
    title: "Put up 24 quarts of tomatoes",
    status: "on_track",
    notes: "",
    linkedModule: "preservation",
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...data,
    chores: {
      ...data.chores,
      members: [...data.chores.members, june, sam],
      chores: [...chores, ...data.chores.chores],
    },
    pantry: {
      ...data.pantry,
      locations: [...data.pantry.locations, basementShelves, chestFreezer],
      products: [tomatoSauce, greenBeans, oats, ...data.pantry.products],
      batches: [...batches, ...data.pantry.batches],
    },
    garden: {
      ...data.garden,
      beds: [northBed, kitchenBed, ...data.garden.beds],
      plantings: [...plantings, ...data.garden.plantings],
      targets: [target, ...data.garden.targets],
    },
    animals: {
      ...data.animals,
      groups: [layingFlock, ...data.animals.groups],
      careReminders: [careReminder, ...data.animals.careReminders],
    },
    preservationPlans: [preservationPlan, ...data.preservationPlans],
    huddle: {
      ...data.huddle,
      seasonPriorities: [seasonPriority, ...data.huddle.seasonPriorities],
      dailyBreadEntries: [dailyBreadEntry, ...data.huddle.dailyBreadEntries],
      weeklyHuddleEntries: [weeklyHuddleEntry, ...data.huddle.weeklyHuddleEntries],
    },
    onboarding: {
      ...data.onboarding,
      sampleDataLoaded: true,
      sampleDataLoadedAt: now,
    },
  };
}

export function stripSampleHomestead(base: RootcellarLocalData): RootcellarLocalData {
  return stripSampleRecords(base);
}

export function confirmAndLoadSampleHomestead(options: { completeOnboarding?: boolean } = {}): boolean {
  const confirmed = window.confirm(
    "Load the sample homestead? This adds example records (marked as samples) alongside anything you already have. You can remove them anytime from Settings.",
  );
  if (!confirmed) return false;

  const now = new Date().toISOString();
  const current = loadRootcellarData();
  const next = buildSampleHomestead(current, now);
  saveRootcellarData(
    options.completeOnboarding
      ? {
          ...next,
          householdProfile: { ...next.householdProfile, onboardingCompletedAt: next.householdProfile.onboardingCompletedAt || now },
          onboarding: { ...next.onboarding, hasCompletedOnboarding: true, completionKind: "finished", completedAt: next.onboarding.completedAt || now },
        }
      : next,
  );
  window.location.assign("/daily-bread");
  return true;
}
