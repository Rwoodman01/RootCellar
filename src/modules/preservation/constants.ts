import type { PreservationMethod, PreservationUnit, ProductType } from "./types";

export const ESTIMATE_DISCLAIMER =
  "Planning estimates only. Always follow tested preservation recipes and current safe canning guidelines.";

export const PRODUCT_OPTIONS: Array<{ value: ProductType; label: string }> = [
  { value: "crushed-tomatoes", label: "Crushed tomatoes" },
  { value: "tomato-sauce", label: "Tomato sauce" },
  { value: "salsa", label: "Salsa" },
  { value: "pickles", label: "Pickles" },
  { value: "jam", label: "Jam" },
  { value: "applesauce", label: "Applesauce" },
  { value: "green-beans", label: "Green beans" },
  { value: "broth-stock", label: "Broth/stock" },
  { value: "peaches-fruit", label: "Peaches/fruit" },
  { value: "freezer-vegetables", label: "Freezer vegetables" },
  { value: "freezer-meat", label: "Freezer meat" },
  { value: "custom", label: "Custom item" },
];

export const METHOD_OPTIONS: Array<{ value: PreservationMethod; label: string }> = [
  { value: "water-bath-canning", label: "Water bath canning" },
  { value: "pressure-canning", label: "Pressure canning" },
  { value: "freezing", label: "Freezing" },
  { value: "dehydrating", label: "Dehydrating" },
  { value: "fermenting", label: "Fermenting" },
  { value: "other", label: "Other" },
];

export const UNIT_OPTIONS: Array<{ value: PreservationUnit; label: string }> = [
  { value: "half-pint-jars", label: "Half-pint jars" },
  { value: "pint-jars", label: "Pint jars" },
  { value: "quart-jars", label: "Quart jars" },
  { value: "jars", label: "Jars" },
  { value: "pounds", label: "Pounds" },
  { value: "gallons", label: "Gallons" },
  { value: "freezer-bags", label: "Freezer bags" },
  { value: "batches", label: "Batches" },
];

export function productLabel(productType: ProductType, customName?: string): string {
  if (productType === "custom") return customName?.trim() || "Custom item";
  return PRODUCT_OPTIONS.find((option) => option.value === productType)?.label || "Preservation item";
}

export function methodLabel(method: PreservationMethod): string {
  return METHOD_OPTIONS.find((option) => option.value === method)?.label || "Other";
}

export function unitLabel(unit: PreservationUnit): string {
  return UNIT_OPTIONS.find((option) => option.value === unit)?.label || "Units";
}
