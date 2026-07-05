import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadRootcellarData, saveRootcellarData } from "../../shared/storage/rootcellarStorage";
import { makeId } from "../../shared/utils/id";
import { ensureGardenData } from "./gardenData";
import type {
  Bed,
  BedInput,
  GardenData,
  GardenSettings,
  GardenTarget,
  GardenTargetInput,
  Harvest,
  HarvestInput,
  Planting,
  PlantingInput,
  SeedPacket,
  SeedPacketInput,
  Variety,
  VarietyInput,
} from "./types";

interface GardenContextValue {
  data: GardenData;
  addBed: (input: BedInput) => Bed;
  updateBed: (bedId: string, input: BedInput) => void;
  deleteBed: (bedId: string) => void;
  addVariety: (input: VarietyInput) => Variety;
  updateVariety: (varietyId: string, input: VarietyInput) => void;
  deleteVariety: (varietyId: string) => void;
  addSeedPacket: (input: SeedPacketInput) => SeedPacket;
  updateSeedPacket: (packetId: string, input: SeedPacketInput) => void;
  deleteSeedPacket: (packetId: string) => void;
  addPlanting: (input: PlantingInput) => Planting;
  updatePlanting: (plantingId: string, input: PlantingInput) => void;
  deletePlanting: (plantingId: string) => void;
  movePlanting: (plantingId: string, bedId: string | undefined, position?: number) => void;
  addHarvest: (input: HarvestInput) => Harvest;
  updateHarvest: (harvestId: string, input: HarvestInput) => void;
  deleteHarvest: (harvestId: string) => void;
  addTarget: (input: GardenTargetInput) => GardenTarget;
  deleteTarget: (targetId: string) => void;
  createPlantingFromTarget: (targetId: string, bedId?: string) => Planting | null;
  updateSettings: (settings: GardenSettings) => void;
}

const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GardenData>(() => ensureGardenData(loadRootcellarData().garden));

  useEffect(() => {
    const current = loadRootcellarData();
    saveRootcellarData({
      ...current,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      garden: data,
    });
  }, [data]);

  const addBed = useCallback((input: BedInput) => {
    const now = new Date().toISOString();
    const bed: Bed = {
      ...input,
      id: makeId("bed"),
      name: input.name.trim(),
      lengthFeet: Math.max(0, input.lengthFeet),
      widthFeet: Math.max(0, input.widthFeet),
      rowFeetCapacity: Math.max(0, input.rowFeetCapacity),
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, beds: [bed, ...current.beds] }));
    return bed;
  }, []);

  const updateBed = useCallback((bedId: string, input: BedInput) => {
    setData((current) => ({
      ...current,
      beds: current.beds.map((bed) =>
        bed.id === bedId
          ? {
              ...bed,
              ...input,
              name: input.name.trim(),
              lengthFeet: Math.max(0, input.lengthFeet),
              widthFeet: Math.max(0, input.widthFeet),
              rowFeetCapacity: Math.max(0, input.rowFeetCapacity),
              updatedAt: new Date().toISOString(),
            }
          : bed,
      ),
    }));
  }, []);

  const deleteBed = useCallback((bedId: string) => {
    setData((current) => ({
      ...current,
      beds: current.beds.filter((bed) => bed.id !== bedId),
      plantings: current.plantings.map((planting) => (planting.bedId === bedId ? { ...planting, bedId: undefined, updatedAt: new Date().toISOString() } : planting)),
    }));
  }, []);

  const addVariety = useCallback((input: VarietyInput) => {
    const now = new Date().toISOString();
    const variety: Variety = { ...input, id: makeId("variety"), crop: input.crop.trim(), name: input.name.trim(), packetDtm: Math.max(0, input.packetDtm), flavorRating: Math.max(0, input.flavorRating), createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, varieties: [variety, ...current.varieties] }));
    return variety;
  }, []);

  const updateVariety = useCallback((varietyId: string, input: VarietyInput) => {
    setData((current) => ({
      ...current,
      varieties: current.varieties.map((variety) => (variety.id === varietyId ? { ...variety, ...input, crop: input.crop.trim(), name: input.name.trim(), packetDtm: Math.max(0, input.packetDtm), flavorRating: Math.max(0, input.flavorRating), updatedAt: new Date().toISOString() } : variety)),
    }));
  }, []);

  const deleteVariety = useCallback((varietyId: string) => {
    setData((current) => ({
      ...current,
      varieties: current.varieties.filter((variety) => variety.id !== varietyId),
      seedPackets: current.seedPackets.filter((packet) => packet.varietyId !== varietyId),
      plantings: current.plantings.map((planting) => (planting.varietyId === varietyId ? { ...planting, varietyId: undefined, seedPacketId: undefined, updatedAt: new Date().toISOString() } : planting)),
    }));
  }, []);

  const addSeedPacket = useCallback((input: SeedPacketInput) => {
    const now = new Date().toISOString();
    const packet: SeedPacket = { ...input, id: makeId("seed"), yearPacked: Math.max(1900, input.yearPacked), createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, seedPackets: [packet, ...current.seedPackets] }));
    return packet;
  }, []);

  const updateSeedPacket = useCallback((packetId: string, input: SeedPacketInput) => {
    setData((current) => ({
      ...current,
      seedPackets: current.seedPackets.map((packet) => (packet.id === packetId ? { ...packet, ...input, yearPacked: Math.max(1900, input.yearPacked), updatedAt: new Date().toISOString() } : packet)),
    }));
  }, []);

  const deleteSeedPacket = useCallback((packetId: string) => {
    setData((current) => ({
      ...current,
      seedPackets: current.seedPackets.filter((packet) => packet.id !== packetId),
      plantings: current.plantings.map((planting) => (planting.seedPacketId === packetId ? { ...planting, seedPacketId: undefined, updatedAt: new Date().toISOString() } : planting)),
    }));
  }, []);

  const addPlanting = useCallback((input: PlantingInput) => {
    const now = new Date().toISOString();
    const planting: Planting = {
      ...input,
      id: makeId("planting"),
      crop: input.crop.trim(),
      quantity: Math.max(0, input.quantity),
      rowFeet: Math.max(0, input.rowFeet),
      squareFeet: Math.max(0, input.squareFeet),
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, plantings: [planting, ...current.plantings] }));
    return planting;
  }, []);

  const updatePlanting = useCallback((plantingId: string, input: PlantingInput) => {
    setData((current) => ({
      ...current,
      plantings: current.plantings.map((planting) =>
        planting.id === plantingId
          ? {
              ...planting,
              ...input,
              crop: input.crop.trim(),
              quantity: Math.max(0, input.quantity),
              rowFeet: Math.max(0, input.rowFeet),
              squareFeet: Math.max(0, input.squareFeet),
              updatedAt: new Date().toISOString(),
            }
          : planting,
      ),
    }));
  }, []);

  const deletePlanting = useCallback((plantingId: string) => {
    setData((current) => ({
      ...current,
      plantings: current.plantings.filter((planting) => planting.id !== plantingId),
      harvests: current.harvests.filter((harvest) => harvest.plantingId !== plantingId),
    }));
  }, []);

  const movePlanting = useCallback((plantingId: string, bedId: string | undefined, position = 0) => {
    setData((current) => ({
      ...current,
      plantings: current.plantings.map((planting) => (planting.id === plantingId ? { ...planting, bedId, bedPosition: position, updatedAt: new Date().toISOString() } : planting)),
    }));
  }, []);

  const addHarvest = useCallback((input: HarvestInput) => {
    const now = new Date().toISOString();
    const harvest: Harvest = { ...input, id: makeId("harvest"), quantity: Math.max(0, input.quantity), createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, harvests: [harvest, ...current.harvests] }));
    return harvest;
  }, []);

  const updateHarvest = useCallback((harvestId: string, input: HarvestInput) => {
    setData((current) => ({
      ...current,
      harvests: current.harvests.map((harvest) => (harvest.id === harvestId ? { ...harvest, ...input, quantity: Math.max(0, input.quantity), updatedAt: new Date().toISOString() } : harvest)),
    }));
  }, []);

  const deleteHarvest = useCallback((harvestId: string) => {
    setData((current) => ({ ...current, harvests: current.harvests.filter((harvest) => harvest.id !== harvestId) }));
  }, []);

  const addTarget = useCallback((input: GardenTargetInput) => {
    const now = new Date().toISOString();
    const target: GardenTarget = { ...input, id: makeId("target"), createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, targets: [target, ...current.targets] }));
    return target;
  }, []);

  const deleteTarget = useCallback((targetId: string) => {
    setData((current) => ({ ...current, targets: current.targets.filter((target) => target.id !== targetId) }));
  }, []);

  const createPlantingFromTarget = useCallback((targetId: string, bedId?: string) => {
    let created: Planting | null = null;
    setData((current) => {
      const target = current.targets.find((entry) => entry.id === targetId);
      if (!target) return current;
      const now = new Date().toISOString();
      created = {
        id: makeId("planting"),
        crop: target.cropProduct,
        bedId: bedId || target.suggestedBedIds[0],
        quantity: target.estimatedPlantsNeeded,
        quantityUnit: "plants",
        rowFeet: target.estimatedRowFeetNeeded,
        squareFeet: target.estimatedRowFeetNeeded,
        bedPosition: current.plantings.length,
        startedIndoorsDate: target.suggestedDates.startIndoors,
        transplantedDate: target.suggestedDates.transplant,
        directSownDate: target.suggestedDates.directSow,
        firstHarvestDate: target.suggestedDates.firstHarvest,
        outcomeRating: 0,
        notes: `Created from garden target: ${target.targetUnits} ${target.targetUnitLabel}.`,
        photoPlaceholder: "",
        createdAt: now,
        updatedAt: now,
      };
      return { ...current, plantings: [created, ...current.plantings] };
    });
    return created;
  }, []);

  const updateSettings = useCallback((settings: GardenSettings) => {
    setData((current) => ({ ...current, settings }));
  }, []);

  const value = useMemo<GardenContextValue>(
    () => ({
      data,
      addBed,
      updateBed,
      deleteBed,
      addVariety,
      updateVariety,
      deleteVariety,
      addSeedPacket,
      updateSeedPacket,
      deleteSeedPacket,
      addPlanting,
      updatePlanting,
      deletePlanting,
      movePlanting,
      addHarvest,
      updateHarvest,
      deleteHarvest,
      addTarget,
      deleteTarget,
      createPlantingFromTarget,
      updateSettings,
    }),
    [data, addBed, updateBed, deleteBed, addVariety, updateVariety, deleteVariety, addSeedPacket, updateSeedPacket, deleteSeedPacket, addPlanting, updatePlanting, deletePlanting, movePlanting, addHarvest, updateHarvest, deleteHarvest, addTarget, deleteTarget, createPlantingFromTarget, updateSettings],
  );

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden(): GardenContextValue {
  const context = useContext(GardenContext);
  if (!context) throw new Error("useGarden must be used inside GardenProvider");
  return context;
}

export function usePlanting(plantingId?: string): Planting | undefined {
  const { data } = useGarden();
  return data.plantings.find((planting) => planting.id === plantingId);
}
