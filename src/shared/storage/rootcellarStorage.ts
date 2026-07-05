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

export interface RootcellarLocalData {
  schemaVersion: 1;
  updatedAt: string;
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

export function loadRootcellarData(): RootcellarLocalData {
  if (typeof localStorage === "undefined") return createEmptyLocalData();

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyLocalData();

  try {
    const parsed = JSON.parse(raw) as Partial<RootcellarLocalData>;
    return {
      schemaVersion: 1,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
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
