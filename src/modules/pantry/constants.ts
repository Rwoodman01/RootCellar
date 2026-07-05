import type { PantryCategory, PantryMethod, PantrySourceType, PantryUnit } from "./types";

export const CATEGORY_OPTIONS: Array<{ value: PantryCategory; label: string; rotationMonths: number }> = [
  { value: "jars-canned", label: "Jars / canned goods", rotationMonths: 18 },
  { value: "freezer", label: "Freezer", rotationMonths: 9 },
  { value: "bulk-meat", label: "Bulk meat", rotationMonths: 12 },
  { value: "dry-bulk", label: "Dry / bulk staples", rotationMonths: 24 },
  { value: "root-cellar", label: "Root cellar / cured", rotationMonths: 5 },
  { value: "dehydrated", label: "Dehydrated", rotationMonths: 12 },
  { value: "fermented", label: "Fermented", rotationMonths: 6 },
  { value: "other", label: "Other / custom", rotationMonths: 12 },
];

export const UNIT_OPTIONS: Array<{ value: PantryUnit; label: string }> = [
  { value: "half-pints", label: "Half-pints" },
  { value: "pints", label: "Pints" },
  { value: "quarts", label: "Quarts" },
  { value: "jars", label: "Jars" },
  { value: "pounds", label: "Pounds" },
  { value: "ounces", label: "Ounces" },
  { value: "gallons", label: "Gallons" },
  { value: "bags", label: "Bags" },
  { value: "buckets", label: "Buckets" },
  { value: "bins", label: "Bins" },
  { value: "containers", label: "Containers" },
  { value: "each", label: "Each" },
];

export const METHOD_OPTIONS: Array<{ value: PantryMethod; label: string }> = [
  { value: "pressure", label: "Pressure canned" },
  { value: "water-bath", label: "Water bath canned" },
  { value: "frozen", label: "Frozen" },
  { value: "dehydrated", label: "Dehydrated" },
  { value: "fermented", label: "Fermented" },
  { value: "mylar-o2", label: "Mylar / oxygen absorber" },
  { value: "bag", label: "Bag" },
  { value: "bin", label: "Bin" },
  { value: "bucket", label: "Bucket" },
  { value: "other", label: "Other" },
];

export const SOURCE_OPTIONS: Array<{ value: PantrySourceType; label: string }> = [
  { value: "manual", label: "Manual entry" },
  { value: "preservation-plan", label: "Preservation plan" },
  { value: "harvest", label: "Harvest" },
  { value: "butcher-batch", label: "Butcher batch" },
  { value: "bought", label: "Bought" },
  { value: "future-record", label: "Future record placeholder" },
];

export const DEFAULT_LOCATION_NAMES = [
  "Pantry shelf",
  "Kitchen pantry",
  "Basement shelf",
  "Garage freezer",
  "Chest freezer",
  "Upright freezer",
  "Cold room",
  "Root cellar",
  "Bucket/bin",
  "Other/custom",
];

export function categoryLabel(category: PantryCategory): string {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label || "Other";
}

export function unitLabel(unit: PantryUnit): string {
  return UNIT_OPTIONS.find((option) => option.value === unit)?.label || "Units";
}

export function methodLabel(method?: PantryMethod): string {
  if (!method) return "No method";
  return METHOD_OPTIONS.find((option) => option.value === method)?.label || "Other";
}

export function sourceLabel(sourceType: PantrySourceType): string {
  return SOURCE_OPTIONS.find((option) => option.value === sourceType)?.label || "Manual entry";
}
