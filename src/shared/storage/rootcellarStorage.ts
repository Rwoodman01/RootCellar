import type { PreservationPlan } from "../../modules/preservation/types";
import type { PantryData } from "../../modules/pantry/types";
import type { GardenData } from "../../modules/garden/types";
import { createEmptyGardenData, ensureGardenData } from "../../modules/garden/gardenData";
import type { AnimalData } from "../../modules/animals/types";
import { createEmptyAnimalData, ensureAnimalData } from "../../modules/animals/animalData";
import type { ChoreData } from "../../modules/chores/types";
import { createEmptyChoreData, ensureChoreData } from "../../modules/chores/choreData";
import type { HuddleData } from "../../modules/huddle/types";
import { createEmptyHuddleData, ensureHuddleData } from "../../modules/huddle/huddleData";

const STORAGE_KEY = "rootcellar.alpha.v1";

export type RootcellarStartFocus = "daily-rhythm" | "food-stores" | "garden" | "animals" | "chores" | "preservation";

export interface RootcellarHouseholdProfile {
  householdName: string;
  locationLabel: string;
  startFocus: RootcellarStartFocus;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type OnboardingRoomId = "preservation" | "pantry" | "garden" | "animals" | "chores";

export interface OnboardingHouseholdBasicsDraft {
  householdName: string;
  lastFrostDate: string;
  firstFrostDate: string;
}

export interface RootcellarOnboardingState {
  hasCompletedOnboarding: boolean;
  completionKind?: "finished" | "skipped";
  completedAt?: string;
  step: 1 | 2 | 3 | 4 | 5;
  selectedRooms: OnboardingRoomId[];
  householdBasics: OnboardingHouseholdBasicsDraft;
  resumeBannerDismissed: boolean;
  sampleDataLoaded: boolean;
  sampleDataLoadedAt?: string;
}

const ONBOARDING_ROOM_IDS: OnboardingRoomId[] = ["preservation", "pantry", "garden", "animals", "chores"];
const DEFAULT_SELECTED_ROOMS: OnboardingRoomId[] = ["pantry", "garden", "chores"];

export interface RootcellarLocalData {
  schemaVersion: 1;
  updatedAt: string;
  householdProfile: RootcellarHouseholdProfile;
  onboarding: RootcellarOnboardingState;
  preservationPlans: PreservationPlan[];
  pantry: PantryData;
  garden: GardenData;
  animals: AnimalData;
  chores: ChoreData;
  huddle: HuddleData;
}

export function createEmptyLocalData(): RootcellarLocalData {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    householdProfile: createDefaultHouseholdProfile(),
    onboarding: createEmptyOnboardingState(),
    preservationPlans: [],
    pantry: {
      products: [],
      batches: [],
      locations: [],
      transactions: [],
    },
    garden: createEmptyGardenData(),
    animals: createEmptyAnimalData(),
    chores: createEmptyChoreData(),
    huddle: createEmptyHuddleData(),
  };
}

export function createEmptyOnboardingState(): RootcellarOnboardingState {
  return {
    hasCompletedOnboarding: false,
    step: 1,
    selectedRooms: [...DEFAULT_SELECTED_ROOMS],
    householdBasics: { householdName: "", lastFrostDate: "", firstFrostDate: "" },
    resumeBannerDismissed: false,
    sampleDataLoaded: false,
  };
}

export function ensureOnboardingState(
  raw?: Partial<RootcellarOnboardingState>,
  profile?: Partial<RootcellarHouseholdProfile>,
): RootcellarOnboardingState {
  const defaults = createEmptyOnboardingState();
  if (!raw && profile?.onboardingCompletedAt) {
    return {
      ...defaults,
      hasCompletedOnboarding: true,
      completionKind: "finished",
      completedAt: profile.onboardingCompletedAt,
    };
  }
  const step = [1, 2, 3, 4, 5].includes(raw?.step as number) ? (raw?.step as RootcellarOnboardingState["step"]) : defaults.step;
  const selectedRooms = Array.isArray(raw?.selectedRooms)
    ? raw.selectedRooms.filter((room): room is OnboardingRoomId => ONBOARDING_ROOM_IDS.includes(room as OnboardingRoomId))
    : defaults.selectedRooms;
  return {
    hasCompletedOnboarding: Boolean(raw?.hasCompletedOnboarding),
    completionKind: raw?.completionKind === "finished" || raw?.completionKind === "skipped" ? raw.completionKind : undefined,
    completedAt: raw?.completedAt || undefined,
    step,
    selectedRooms,
    householdBasics: {
      householdName: raw?.householdBasics?.householdName || "",
      lastFrostDate: raw?.householdBasics?.lastFrostDate || "",
      firstFrostDate: raw?.householdBasics?.firstFrostDate || "",
    },
    resumeBannerDismissed: Boolean(raw?.resumeBannerDismissed),
    sampleDataLoaded: Boolean(raw?.sampleDataLoaded),
    sampleDataLoadedAt: raw?.sampleDataLoadedAt || undefined,
  };
}

export function loadRootcellarData(): RootcellarLocalData {
  if (typeof localStorage === "undefined") return createEmptyLocalData();

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyLocalData();

  try {
    const parsed = JSON.parse(raw) as Partial<RootcellarLocalData>;
    const householdProfile = ensureHouseholdProfile(parsed.householdProfile);
    return {
      schemaVersion: 1,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      householdProfile,
      onboarding: ensureOnboardingState(parsed.onboarding, householdProfile),
      preservationPlans: Array.isArray(parsed.preservationPlans) ? parsed.preservationPlans : [],
      pantry: {
        products: Array.isArray(parsed.pantry?.products) ? parsed.pantry.products : [],
        batches: Array.isArray(parsed.pantry?.batches) ? parsed.pantry.batches : [],
        locations: Array.isArray(parsed.pantry?.locations) ? parsed.pantry.locations : [],
        transactions: Array.isArray(parsed.pantry?.transactions) ? parsed.pantry.transactions : [],
      },
      garden: ensureGardenData(parsed.garden),
      animals: ensureAnimalData(parsed.animals),
      chores: ensureChoreData(parsed.chores),
      huddle: ensureHuddleData(parsed.huddle),
    };
  } catch {
    return createEmptyLocalData();
  }
}

export function saveRootcellarData(data: RootcellarLocalData): void {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...data,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function clearRootcellarData(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function createDefaultHouseholdProfile(): RootcellarHouseholdProfile {
  const now = new Date().toISOString();
  return {
    householdName: "Our household",
    locationLabel: "",
    startFocus: "daily-rhythm",
    createdAt: now,
    updatedAt: now,
  };
}

export function ensureHouseholdProfile(profile?: Partial<RootcellarHouseholdProfile>): RootcellarHouseholdProfile {
  const defaults = createDefaultHouseholdProfile();
  const startFocuses: RootcellarStartFocus[] = ["daily-rhythm", "food-stores", "garden", "animals", "chores", "preservation"];
  return {
    householdName: profile?.householdName?.trim() || defaults.householdName,
    locationLabel: profile?.locationLabel?.trim() || "",
    startFocus: startFocuses.includes(profile?.startFocus as RootcellarStartFocus) ? (profile?.startFocus as RootcellarStartFocus) : defaults.startFocus,
    onboardingCompletedAt: profile?.onboardingCompletedAt || undefined,
    createdAt: profile?.createdAt || defaults.createdAt,
    updatedAt: profile?.updatedAt || defaults.updatedAt,
  };
}
