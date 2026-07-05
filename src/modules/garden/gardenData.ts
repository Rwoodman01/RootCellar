import { DEFAULT_GARDEN_SETTINGS } from "./constants";
import type { Bed, GardenData } from "./types";

export function createEmptyGardenData(): GardenData {
  return {
    beds: [],
    varieties: [],
    seedPackets: [],
    plantings: [],
    harvests: [],
    targets: [],
    settings: DEFAULT_GARDEN_SETTINGS,
  };
}

export function ensureGardenData(data?: Partial<GardenData>): GardenData {
  return {
    beds: Array.isArray(data?.beds) ? data.beds.map(ensureBed) : [],
    varieties: Array.isArray(data?.varieties) ? data.varieties : [],
    seedPackets: Array.isArray(data?.seedPackets) ? data.seedPackets : [],
    plantings: Array.isArray(data?.plantings)
      ? data.plantings.map((planting) => ({
          ...planting,
          squareFeet: Math.max(0, Number(planting.squareFeet) || Number(planting.rowFeet) || 0),
        }))
      : [],
    harvests: Array.isArray(data?.harvests) ? data.harvests : [],
    targets: Array.isArray(data?.targets) ? data.targets : [],
    settings: {
      lastFrostDate: data?.settings?.lastFrostDate || DEFAULT_GARDEN_SETTINGS.lastFrostDate,
      firstFrostDate: data?.settings?.firstFrostDate || DEFAULT_GARDEN_SETTINGS.firstFrostDate,
    },
  };
}

function ensureBed(bed: Partial<Bed>): Bed {
  const rowFeetCapacity = Math.max(0, Number(bed.rowFeetCapacity) || 0);
  return {
    id: bed.id || "",
    name: bed.name || "Unnamed bed",
    areaName: bed.areaName || "Main garden",
    planningMode: bed.planningMode || "row-feet",
    lengthFeet: Math.max(0, Number(bed.lengthFeet) || rowFeetCapacity || 4),
    widthFeet: Math.max(0, Number(bed.widthFeet) || 4),
    rowFeetCapacity,
    sun: bed.sun || "full-sun",
    soilNotes: bed.soilNotes || "",
    notes: bed.notes || "",
    createdAt: bed.createdAt || new Date().toISOString(),
    updatedAt: bed.updatedAt || new Date().toISOString(),
  };
}
