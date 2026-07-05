import type { PlanEstimate, PreservationItem, PreservationMethod, ProductType, PreservationUnit, ShoppingListTotals } from "./types";

interface ProductAssumption {
  poundsPerPint: number;
  preferredJar: "halfPint" | "pint" | "quart";
  assumptions: string[];
  supplies?: Record<string, number>;
}

const BUFFER = 1.1;

const PRODUCT_ASSUMPTIONS: Record<ProductType, ProductAssumption> = {
  "crushed-tomatoes": {
    poundsPerPint: 1.75,
    preferredJar: "quart",
    assumptions: ["Assumes about 3.5 lb tomatoes per quart before trimming and a 10% planning buffer."],
    supplies: { "Bottled lemon juice bottles": 0.1 },
  },
  "tomato-sauce": {
    poundsPerPint: 2.5,
    preferredJar: "pint",
    assumptions: ["Assumes sauce cooks down to about 2.5 lb tomatoes per pint and includes a 10% buffer."],
    supplies: { "Bottled lemon juice bottles": 0.1 },
  },
  salsa: {
    poundsPerPint: 2,
    preferredJar: "pint",
    assumptions: ["Assumes salsa yield near 2 lb mixed produce per pint and includes a 10% buffer."],
    supplies: { "Vinegar quarts": 0.25, "Pickling salt boxes": 0.05 },
  },
  pickles: {
    poundsPerPint: 1.4,
    preferredJar: "quart",
    assumptions: ["Assumes about 2.8 lb cucumbers per quart and includes a 10% buffer."],
    supplies: { "Vinegar quarts": 0.35, "Pickling salt boxes": 0.05 },
  },
  jam: {
    poundsPerPint: 2,
    preferredJar: "halfPint",
    assumptions: ["Assumes two half-pints per pint target, roughly 1 lb fruit per half-pint, plus a 10% buffer."],
    supplies: { "Pectin boxes": 0.125, "Sugar 5 lb bags": 0.08 },
  },
  applesauce: {
    poundsPerPint: 1.5,
    preferredJar: "quart",
    assumptions: ["Assumes about 3 lb apples per quart before peeling, coring, and cooking."],
  },
  "green-beans": {
    poundsPerPint: 0.9,
    preferredJar: "quart",
    assumptions: ["Assumes about 1.8 lb trimmed beans per quart and a 10% planning buffer."],
    supplies: { "Canning salt boxes": 0.03 },
  },
  "broth-stock": {
    poundsPerPint: 0,
    preferredJar: "quart",
    assumptions: ["Assumes finished stock volume is already known. Bones, vegetables, and salt vary by recipe."],
  },
  "peaches-fruit": {
    poundsPerPint: 1.25,
    preferredJar: "quart",
    assumptions: ["Assumes about 2.5 lb prepared fruit per quart and includes a 10% buffer."],
    supplies: { "Sugar 5 lb bags": 0.04 },
  },
  "freezer-vegetables": {
    poundsPerPint: 1,
    preferredJar: "quart",
    assumptions: ["Assumes one quart freezer bag holds about 2 lb prepared vegetables."],
    supplies: { "Freezer labels": 1 },
  },
  "freezer-meat": {
    poundsPerPint: 1,
    preferredJar: "quart",
    assumptions: ["Assumes one freezer bag or package per planned meal-sized portion unless pounds are entered."],
    supplies: { "Freezer labels": 1 },
  },
  custom: {
    poundsPerPint: 1,
    preferredJar: "pint",
    assumptions: ["Custom item uses one pound per pint-equivalent until a tested household assumption is added."],
  },
};

function emptyEstimate(): PlanEstimate {
  return {
    jarCounts: { halfPint: 0, pint: 0, quart: 0, any: 0 },
    regularLids: 0,
    wideMouthLids: 0,
    freezerBags: 0,
    freezerQuarts: 0,
    producePounds: 0,
    dehydratedPints: 0,
    fermentationQuarts: 0,
    supplyCounts: {},
    assumptions: [],
  };
}

function roundUp(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value);
}

function pintEquivalent(quantity: number, unit: PreservationUnit, poundsPerPint = 1): number {
  switch (unit) {
    case "half-pint-jars":
      return quantity * 0.5;
    case "pint-jars":
      return quantity;
    case "quart-jars":
      return quantity * 2;
    case "jars":
      return quantity;
    case "pounds":
      return poundsPerPint > 0 ? quantity / poundsPerPint : 0;
    case "gallons":
      return quantity * 8;
    case "freezer-bags":
      return quantity * 2;
    case "batches":
      return quantity * 6;
    default:
      return quantity;
  }
}

function preferredJarLabel(preferredJar: ProductAssumption["preferredJar"]): string {
  if (preferredJar === "halfPint") return "half-pint";
  if (preferredJar === "quart") return "quart";
  return "pint";
}

function addPreferredJarCount(estimate: PlanEstimate, preferredJar: ProductAssumption["preferredJar"], count: number) {
  if (preferredJar === "halfPint") {
    estimate.jarCounts.halfPint = count;
    return;
  }

  if (preferredJar === "quart") {
    estimate.jarCounts.quart = count;
    return;
  }

  estimate.jarCounts.pint = count;
}

function produceEstimate(quantity: number, unit: PreservationUnit, pints: number, poundsPerPint: number): number {
  if (unit === "pounds") return roundUp(quantity * BUFFER);
  if (poundsPerPint <= 0) return 0;
  return roundUp(poundsPerPint * pints * BUFFER);
}

function addSupplies(target: Record<string, number>, source: Record<string, number> | undefined, multiplier: number) {
  if (!source) return;

  Object.entries(source).forEach(([name, amount]) => {
    target[name] = (target[name] || 0) + roundUp(amount * multiplier);
  });
}

function isCanning(method: PreservationMethod): boolean {
  return method === "water-bath-canning" || method === "pressure-canning";
}

export function estimateItem(item: PreservationItem): PlanEstimate {
  const estimate = emptyEstimate();
  const quantity = Math.max(0, item.targetQuantity || 0);
  const assumption = PRODUCT_ASSUMPTIONS[item.productType];
  const pints = pintEquivalent(quantity, item.unit, assumption.poundsPerPint);
  const bufferedPints = pints * BUFFER;

  estimate.assumptions.push(...assumption.assumptions);

  if (isCanning(item.method)) {
    if (item.unit === "half-pint-jars") {
      estimate.jarCounts.halfPint = roundUp(quantity);
      estimate.assumptions.push("Jar count follows the selected half-pint jar unit.");
    } else if (item.unit === "pint-jars") {
      estimate.jarCounts.pint = roundUp(quantity);
      estimate.assumptions.push("Jar count follows the selected pint jar unit.");
    } else if (item.unit === "quart-jars") {
      estimate.jarCounts.quart = roundUp(quantity);
      estimate.assumptions.push("Jar count follows the selected quart jar unit.");
    } else if (item.unit === "jars") {
      addPreferredJarCount(estimate, assumption.preferredJar, roundUp(quantity));
      estimate.assumptions.push(`Generic jars use this product's usual ${preferredJarLabel(assumption.preferredJar)} planning size.`);
    } else if (assumption.preferredJar === "halfPint") {
      estimate.jarCounts.halfPint = roundUp(bufferedPints * 2);
    } else if (assumption.preferredJar === "quart") {
      estimate.jarCounts.quart = roundUp(bufferedPints / 2);
    } else {
      estimate.jarCounts.pint = roundUp(bufferedPints);
    }

    estimate.regularLids = estimate.jarCounts.halfPint + estimate.jarCounts.pint;
    estimate.wideMouthLids = estimate.jarCounts.quart;
    estimate.producePounds = produceEstimate(quantity, item.unit, pints, assumption.poundsPerPint);
    addSupplies(estimate.supplyCounts, assumption.supplies, Math.max(estimate.regularLids + estimate.wideMouthLids, 1));
    estimate.assumptions.push("Produce estimates include a small buffer so a short yield does not stall the day.");
    return estimate;
  }

  if (item.method === "freezing") {
    if (item.unit === "freezer-bags") {
      estimate.freezerBags = roundUp(quantity * BUFFER);
      estimate.freezerQuarts = roundUp(quantity * 1.1);
    } else if (item.unit === "pounds") {
      estimate.freezerBags = roundUp(quantity / 2);
      estimate.freezerQuarts = roundUp(quantity / 2);
    } else {
      estimate.freezerBags = roundUp(bufferedPints / 2);
      estimate.freezerQuarts = roundUp(bufferedPints / 2);
    }
    estimate.producePounds = produceEstimate(quantity, item.unit, pints, assumption.poundsPerPint);
    addSupplies(estimate.supplyCounts, assumption.supplies, estimate.freezerBags);
    estimate.assumptions.push("Freezer estimates assume quart bags filled flat with headspace for expansion.");
    return estimate;
  }

  if (item.method === "dehydrating") {
    estimate.dehydratedPints = roundUp(pints / 4);
    estimate.producePounds = produceEstimate(quantity, item.unit, pints, assumption.poundsPerPint);
    estimate.supplyCounts["Airtight storage jars"] = estimate.dehydratedPints;
    estimate.assumptions.push("Dehydrated volume is estimated at roughly one quarter of fresh prepared volume.");
    return estimate;
  }

  if (item.method === "fermenting") {
    estimate.fermentationQuarts = roundUp(bufferedPints / 2);
    estimate.producePounds = produceEstimate(quantity, item.unit, pints, assumption.poundsPerPint);
    estimate.supplyCounts["Fermentation salt boxes"] = roundUp(estimate.fermentationQuarts * 0.05);
    estimate.assumptions.push("Fermentation estimates assume quart vessels and room for brine expansion.");
    return estimate;
  }

  estimate.jarCounts.any = roundUp(bufferedPints);
  estimate.producePounds = produceEstimate(quantity, item.unit, pints, assumption.poundsPerPint);
  estimate.assumptions.push("Other method uses pint-equivalent storage as a planning placeholder.");
  return estimate;
}

export function estimatePlan(items: PreservationItem[]): ShoppingListTotals {
  return items.reduce<ShoppingListTotals>(
    (totals, item) => {
      const estimate = estimateItem(item);

      totals.jars.halfPint += estimate.jarCounts.halfPint;
      totals.jars.pint += estimate.jarCounts.pint;
      totals.jars.quart += estimate.jarCounts.quart;
      totals.jars.any += estimate.jarCounts.any;
      totals.lids.regular += estimate.regularLids;
      totals.lids.wideMouth += estimate.wideMouthLids;
      totals.freezerBags += estimate.freezerBags;
      totals.freezerQuarts += estimate.freezerQuarts;
      totals.producePounds += estimate.producePounds;
      totals.dehydratedPints += estimate.dehydratedPints;
      totals.fermentationQuarts += estimate.fermentationQuarts;

      Object.entries(estimate.supplyCounts).forEach(([name, amount]) => {
        totals.supplies[name] = (totals.supplies[name] || 0) + amount;
      });

      return totals;
    },
    {
      jars: { halfPint: 0, pint: 0, quart: 0, any: 0 },
      lids: { regular: 0, wideMouth: 0 },
      freezerBags: 0,
      freezerQuarts: 0,
      producePounds: 0,
      dehydratedPints: 0,
      fermentationQuarts: 0,
      supplies: {},
    },
  );
}
