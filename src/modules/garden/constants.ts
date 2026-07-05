import type { HarvestDestination, SunExposure } from "./types";

export interface CropDefaults {
  crop: string;
  family: string;
  poundsPerPlant: number;
  poundsPerRowFoot: number;
  plantsPerRowFoot: number;
  defaultDtm: number;
  startIndoorsWeeksBeforeLastFrost?: number;
  transplantWeeksAfterLastFrost?: number;
  directSowWeeksAfterLastFrost?: number;
  viabilityYears: number;
}

export const CROP_DEFAULTS: CropDefaults[] = [
  { crop: "Tomato", family: "Solanaceae", poundsPerPlant: 10, poundsPerRowFoot: 3, plantsPerRowFoot: 0.33, defaultDtm: 78, startIndoorsWeeksBeforeLastFrost: 6, transplantWeeksAfterLastFrost: 2, viabilityYears: 4 },
  { crop: "Pepper", family: "Solanaceae", poundsPerPlant: 3, poundsPerRowFoot: 1.4, plantsPerRowFoot: 0.5, defaultDtm: 75, startIndoorsWeeksBeforeLastFrost: 8, transplantWeeksAfterLastFrost: 2, viabilityYears: 3 },
  { crop: "Green bean", family: "Fabaceae", poundsPerPlant: 0.35, poundsPerRowFoot: 0.8, plantsPerRowFoot: 2.5, defaultDtm: 55, directSowWeeksAfterLastFrost: 1, viabilityYears: 3 },
  { crop: "Cucumber", family: "Cucurbitaceae", poundsPerPlant: 8, poundsPerRowFoot: 2.5, plantsPerRowFoot: 0.5, defaultDtm: 58, directSowWeeksAfterLastFrost: 1, viabilityYears: 5 },
  { crop: "Winter squash", family: "Cucurbitaceae", poundsPerPlant: 9, poundsPerRowFoot: 1.2, plantsPerRowFoot: 0.2, defaultDtm: 95, directSowWeeksAfterLastFrost: 1, viabilityYears: 5 },
  { crop: "Carrot", family: "Apiaceae", poundsPerPlant: 0.12, poundsPerRowFoot: 1.2, plantsPerRowFoot: 12, defaultDtm: 70, directSowWeeksAfterLastFrost: -3, viabilityYears: 3 },
  { crop: "Beet", family: "Amaranthaceae", poundsPerPlant: 0.22, poundsPerRowFoot: 1.5, plantsPerRowFoot: 8, defaultDtm: 58, directSowWeeksAfterLastFrost: -3, viabilityYears: 4 },
  { crop: "Onion", family: "Amaryllidaceae", poundsPerPlant: 0.3, poundsPerRowFoot: 1.6, plantsPerRowFoot: 6, defaultDtm: 100, startIndoorsWeeksBeforeLastFrost: 10, transplantWeeksAfterLastFrost: -3, viabilityYears: 1 },
  { crop: "Garlic", family: "Amaryllidaceae", poundsPerPlant: 0.15, poundsPerRowFoot: 1.1, plantsPerRowFoot: 6, defaultDtm: 250, viabilityYears: 1 },
  { crop: "Cabbage", family: "Brassicaceae", poundsPerPlant: 3, poundsPerRowFoot: 2.2, plantsPerRowFoot: 0.75, defaultDtm: 75, startIndoorsWeeksBeforeLastFrost: 6, transplantWeeksAfterLastFrost: -2, viabilityYears: 4 },
  { crop: "Kale", family: "Brassicaceae", poundsPerPlant: 1.5, poundsPerRowFoot: 1.8, plantsPerRowFoot: 1, defaultDtm: 55, directSowWeeksAfterLastFrost: -3, viabilityYears: 4 },
  { crop: "Lettuce", family: "Asteraceae", poundsPerPlant: 0.35, poundsPerRowFoot: 1, plantsPerRowFoot: 4, defaultDtm: 45, directSowWeeksAfterLastFrost: -4, viabilityYears: 3 },
  { crop: "Potato", family: "Solanaceae", poundsPerPlant: 2, poundsPerRowFoot: 2.5, plantsPerRowFoot: 1, defaultDtm: 95, directSowWeeksAfterLastFrost: -2, viabilityYears: 1 },
];

export const SUN_OPTIONS: Array<{ value: SunExposure; label: string }> = [
  { value: "full-sun", label: "Full sun" },
  { value: "part-sun", label: "Part sun" },
  { value: "shade", label: "Shade" },
];

export const HARVEST_DESTINATIONS: Array<{ value: HarvestDestination; label: string }> = [
  { value: "fresh", label: "Fresh eating" },
  { value: "preserved", label: "Preserved" },
  { value: "pantry", label: "Pantry" },
  { value: "fed-to-animals", label: "Fed to animals" },
  { value: "sold", label: "Sold" },
  { value: "composted", label: "Composted" },
  { value: "other", label: "Other" },
];

export const DEFAULT_GARDEN_SETTINGS = {
  lastFrostDate: `${new Date().getFullYear()}-05-15`,
  firstFrostDate: `${new Date().getFullYear()}-10-15`,
};

export function cropDefaultsFor(crop: string): CropDefaults {
  const normalized = crop.trim().toLowerCase();
  return CROP_DEFAULTS.find((entry) => entry.crop.toLowerCase() === normalized) || CROP_DEFAULTS[0];
}

export function cropFamily(crop: string): string {
  return cropDefaultsFor(crop).family;
}

export function harvestDestinationLabel(destination: HarvestDestination): string {
  return HARVEST_DESTINATIONS.find((entry) => entry.value === destination)?.label || "Other";
}
