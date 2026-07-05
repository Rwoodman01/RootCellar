import { cropDefaultsFor } from "./constants";
import type { Bed, GardenTargetInput, Planting, SeedPacket, Variety } from "./types";

function addDays(dateValue: string, days: number): string | undefined {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export interface PlanBackwardInput {
  cropProduct: string;
  targetUnits: number;
  targetUnitLabel: string;
  poundsPerUnit: number;
  lastFrostDate: string;
  firstFrostDate: string;
  source?: GardenTargetInput["source"];
  sourceId?: string;
}

export function planBackward(input: PlanBackwardInput): GardenTargetInput {
  const defaults = cropDefaultsFor(input.cropProduct);
  const pounds = Math.max(0, input.targetUnits) * Math.max(0, input.poundsPerUnit);
  const plants = Math.ceil(pounds / defaults.poundsPerPlant);
  const rowFeet = Math.ceil(pounds / defaults.poundsPerRowFoot);
  const transplant = defaults.transplantWeeksAfterLastFrost !== undefined ? addDays(input.lastFrostDate, defaults.transplantWeeksAfterLastFrost * 7) : undefined;
  const directSow = defaults.directSowWeeksAfterLastFrost !== undefined ? addDays(input.lastFrostDate, defaults.directSowWeeksAfterLastFrost * 7) : undefined;
  const startIndoors =
    defaults.startIndoorsWeeksBeforeLastFrost !== undefined ? addDays(input.lastFrostDate, defaults.startIndoorsWeeksBeforeLastFrost * -7) : undefined;
  const anchorDate = transplant || directSow || input.lastFrostDate;

  return {
    source: input.source || "manual",
    sourceId: input.sourceId,
    cropProduct: input.cropProduct.trim() || defaults.crop,
    targetUnits: Math.max(0, input.targetUnits),
    targetUnitLabel: input.targetUnitLabel.trim() || "units",
    estimatedPoundsNeeded: Math.round(pounds * 10) / 10,
    estimatedPlantsNeeded: Math.max(1, plants),
    estimatedRowFeetNeeded: Math.max(1, rowFeet),
    suggestedBedIds: [],
    suggestedDates: {
      startIndoors,
      transplant,
      directSow,
      firstHarvest: addDays(anchorDate, defaults.defaultDtm),
    },
    assumptionsUsed: [
      `${defaults.crop} default: ${defaults.poundsPerPlant} lb/plant and ${defaults.poundsPerRowFoot} lb/row-ft.`,
      `${input.poundsPerUnit} lb per ${input.targetUnitLabel || "unit"} target.`,
      `Dates use last frost ${input.lastFrostDate} and first frost ${input.firstFrostDate}.`,
    ],
  };
}

export function bedUsedRowFeet(bedId: string, plantings: Planting[]): number {
  return plantings.filter((planting) => planting.bedId === bedId).reduce((sum, planting) => sum + Math.max(0, planting.rowFeet), 0);
}

export function bedUsedSquareFeet(bedId: string, plantings: Planting[]): number {
  return plantings.filter((planting) => planting.bedId === bedId).reduce((sum, planting) => sum + Math.max(0, planting.squareFeet || planting.rowFeet), 0);
}

export function bedSquareFeet(bed: Bed): number {
  return Math.max(0, bed.lengthFeet || 0) * Math.max(0, bed.widthFeet || 0);
}

export function bedCapacityLabel(bed: Bed): string {
  if (bed.planningMode === "square-feet") return `${bed.lengthFeet} x ${bed.widthFeet} ft · ${bedSquareFeet(bed)} sq ft`;
  return `${bed.rowFeetCapacity} row-ft capacity`;
}

export function seedPacketWarning(packet: SeedPacket, variety: Variety | undefined, currentYear = new Date().getFullYear()): string | null {
  const defaults = cropDefaultsFor(variety?.crop || "");
  const age = currentYear - packet.yearPacked;
  if (age > defaults.viabilityYears) return `${defaults.crop} seed is usually past its ${defaults.viabilityYears}-year viability window.`;
  if (age === defaults.viabilityYears) return `${defaults.crop} seed is at the edge of its usual viability window.`;
  return null;
}

export function fallFit(crop: string, sowingDate: string, firstFrostDate: string, fallFactorDays = 14) {
  const defaults = cropDefaultsFor(crop);
  const harvestDate = addDays(sowingDate, defaults.defaultDtm + fallFactorDays);
  const harvest = harvestDate ? new Date(`${harvestDate}T12:00:00`) : null;
  const frost = new Date(`${firstFrostDate}T12:00:00`);
  const fits = Boolean(harvest && !Number.isNaN(frost.getTime()) && harvest <= frost);
  return {
    crop: defaults.crop,
    dtm: defaults.defaultDtm,
    fallFactorDays,
    estimatedHarvestDate: harvestDate,
    fits,
  };
}

export function rotationWhispers(beds: Bed[], plantings: Planting[]): string[] {
  const currentYear = new Date().getFullYear();
  return beds.flatMap((bed) => {
    const recent = plantings.filter((planting) => {
      if (planting.bedId !== bed.id) return false;
      const date = planting.transplantedDate || planting.directSownDate || planting.startedIndoorsDate || planting.createdAt.slice(0, 10);
      const year = Number(date.slice(0, 4));
      return currentYear - year <= 2;
    });
    const families = new Set(recent.map((planting) => cropDefaultsFor(planting.crop).family));
    if (families.size === 0) return [];
    return [`${bed.name}: recent ${Array.from(families).join(", ")} planting history.`];
  });
}
