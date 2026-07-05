export type ProductType =
  | "crushed-tomatoes"
  | "tomato-sauce"
  | "salsa"
  | "pickles"
  | "jam"
  | "applesauce"
  | "green-beans"
  | "broth-stock"
  | "peaches-fruit"
  | "freezer-vegetables"
  | "freezer-meat"
  | "custom";

export type PreservationMethod =
  | "water-bath-canning"
  | "pressure-canning"
  | "freezing"
  | "dehydrating"
  | "fermenting"
  | "other";

export type PreservationUnit =
  | "half-pint-jars"
  | "pint-jars"
  | "quart-jars"
  | "jars"
  | "pounds"
  | "gallons"
  | "freezer-bags"
  | "batches";

export interface PreservationItem {
  id: string;
  productType: ProductType;
  customName?: string;
  method: PreservationMethod;
  targetQuantity: number;
  unit: PreservationUnit;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreservationSession {
  id: string;
  title: string;
  date: string;
  itemIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreservationPlan {
  id: string;
  title: string;
  householdName: string;
  seasonYear: number;
  notes: string;
  items: PreservationItem[];
  sessions: PreservationSession[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanEstimate {
  jarCounts: {
    halfPint: number;
    pint: number;
    quart: number;
    any: number;
  };
  regularLids: number;
  wideMouthLids: number;
  freezerBags: number;
  freezerQuarts: number;
  producePounds: number;
  dehydratedPints: number;
  fermentationQuarts: number;
  supplyCounts: Record<string, number>;
  assumptions: string[];
}

export interface ShoppingListTotals {
  jars: {
    halfPint: number;
    pint: number;
    quart: number;
    any: number;
  };
  lids: {
    regular: number;
    wideMouth: number;
  };
  freezerBags: number;
  freezerQuarts: number;
  producePounds: number;
  dehydratedPints: number;
  fermentationQuarts: number;
  supplies: Record<string, number>;
}
