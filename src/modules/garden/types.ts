export type SunExposure = "full-sun" | "part-sun" | "shade";
export type GrowAgainFlag = "yes" | "no" | "maybe";
export type HarvestDestination = "fresh" | "preserved" | "pantry" | "fed-to-animals" | "sold" | "composted" | "other";
export type GardenTargetSource = "manual" | "preservation-planner";

export interface Bed {
  id: string;
  name: string;
  areaName: string;
  planningMode: "row-feet" | "square-feet";
  lengthFeet: number;
  widthFeet: number;
  rowFeetCapacity: number;
  sun: SunExposure;
  soilNotes: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Variety {
  id: string;
  crop: string;
  name: string;
  source: string;
  packetDtm: number;
  germinationNotes: string;
  flavorRating: number;
  diseaseNotes: string;
  growAgain: GrowAgainFlag;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeedPacket {
  id: string;
  varietyId: string;
  yearPacked: number;
  quantityEstimate: string;
  seedBoxLocation: string;
  photoPlaceholder: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Planting {
  id: string;
  crop: string;
  varietyId?: string;
  bedId?: string;
  quantity: number;
  quantityUnit: "plants" | "row-feet";
  rowFeet: number;
  squareFeet: number;
  bedPosition: number;
  seedPacketId?: string;
  startedIndoorsDate?: string;
  transplantedDate?: string;
  directSownDate?: string;
  firstHarvestDate?: string;
  lastHarvestDate?: string;
  outcomeRating: number;
  successionOf?: string;
  notes: string;
  photoPlaceholder: string;
  createdAt: string;
  updatedAt: string;
}

export interface Harvest {
  id: string;
  plantingId: string;
  quantity: number;
  unit: string;
  date: string;
  destination: HarvestDestination;
  preservationBatchLink?: string;
  pantryBatchLink?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GardenTarget {
  id: string;
  source: GardenTargetSource;
  sourceId?: string;
  cropProduct: string;
  targetUnits: number;
  targetUnitLabel: string;
  estimatedPoundsNeeded: number;
  estimatedPlantsNeeded: number;
  estimatedRowFeetNeeded: number;
  suggestedBedIds: string[];
  suggestedDates: {
    startIndoors?: string;
    transplant?: string;
    directSow?: string;
    firstHarvest?: string;
  };
  assumptionsUsed: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GardenSettings {
  lastFrostDate: string;
  firstFrostDate: string;
}

export interface GardenData {
  beds: Bed[];
  varieties: Variety[];
  seedPackets: SeedPacket[];
  plantings: Planting[];
  harvests: Harvest[];
  targets: GardenTarget[];
  settings: GardenSettings;
}

export type BedInput = Omit<Bed, "id" | "createdAt" | "updatedAt">;
export type VarietyInput = Omit<Variety, "id" | "createdAt" | "updatedAt">;
export type SeedPacketInput = Omit<SeedPacket, "id" | "createdAt" | "updatedAt">;
export type PlantingInput = Omit<Planting, "id" | "createdAt" | "updatedAt">;
export type HarvestInput = Omit<Harvest, "id" | "createdAt" | "updatedAt">;
export type GardenTargetInput = Omit<GardenTarget, "id" | "createdAt" | "updatedAt">;
