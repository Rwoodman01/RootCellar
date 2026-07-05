import type { Bed, Harvest, Planting, Variety } from "./types";

export function bedName(beds: Bed[], bedId?: string): string {
  return beds.find((bed) => bed.id === bedId)?.name || "Unassigned";
}

export function varietyName(varieties: Variety[], varietyId?: string): string {
  const variety = varieties.find((entry) => entry.id === varietyId);
  return variety ? `${variety.name} ${variety.crop}` : "";
}

export function plantingLabel(planting: Planting, varieties: Variety[]): string {
  const variety = varietyName(varieties, planting.varietyId);
  return variety || planting.crop;
}

export function harvestTotalForPlanting(plantingId: string, harvests: Harvest[]): number {
  return harvests.filter((harvest) => harvest.plantingId === plantingId).reduce((sum, harvest) => sum + harvest.quantity, 0);
}

export function sortedPlantingsForBed(bedId: string | undefined, plantings: Planting[]): Planting[] {
  return plantings
    .filter((planting) => planting.bedId === bedId)
    .slice()
    .sort((a, b) => a.bedPosition - b.bedPosition || a.crop.localeCompare(b.crop));
}
