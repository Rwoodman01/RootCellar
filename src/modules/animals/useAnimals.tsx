import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadRootcellarData, saveRootcellarData } from "../../shared/storage/rootcellarStorage";
import { makeId } from "../../shared/utils/id";
import { productionDestinationLabel, productionTypeLabel } from "./constants";
import { ensureAnimalData } from "./animalData";
import { todayDate } from "./animalUtils";
import type {
  AnimalData,
  AnimalEvent,
  AnimalEventInput,
  AnimalEventType,
  AnimalGroup,
  AnimalGroupInput,
  CareReminder,
  CareReminderInput,
  FeedRecord,
  FeedRecordInput,
  IndividualAnimal,
  IndividualAnimalInput,
  ProductionRecord,
  ProductionRecordInput,
  ProductionType,
} from "./types";

interface AnimalsContextValue {
  data: AnimalData;
  addGroup: (input: AnimalGroupInput) => AnimalGroup;
  updateGroup: (groupId: string, input: AnimalGroupInput) => void;
  adjustGroupCount: (groupId: string, nextCount: number, note?: string) => void;
  addIndividual: (input: IndividualAnimalInput) => IndividualAnimal;
  updateIndividual: (animalId: string, input: IndividualAnimalInput) => void;
  addEvent: (input: AnimalEventInput) => AnimalEvent;
  addFeedRecord: (input: FeedRecordInput) => FeedRecord;
  addProductionRecord: (input: ProductionRecordInput) => ProductionRecord;
  addCareReminder: (input: CareReminderInput) => CareReminder;
  updateCareReminder: (reminderId: string, input: CareReminderInput) => void;
}

const AnimalsContext = createContext<AnimalsContextValue | null>(null);

export function AnimalsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AnimalData>(() => ensureAnimalData(loadRootcellarData().animals));

  useEffect(() => {
    const current = loadRootcellarData();
    saveRootcellarData({
      ...current,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      animals: data,
    });
  }, [data]);

  const addGroup = useCallback((input: AnimalGroupInput) => {
    const now = new Date().toISOString();
    const group: AnimalGroup = {
      ...input,
      id: makeId("animal-group"),
      name: input.name.trim() || "Unnamed group",
      species: input.species.trim() || "Animals",
      count: Math.max(0, input.count),
      location: input.location.trim(),
      notes: input.notes || "",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, groups: [group, ...current.groups] }));
    return group;
  }, []);

  const updateGroup = useCallback((groupId: string, input: AnimalGroupInput) => {
    setData((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              ...input,
              name: input.name.trim() || "Unnamed group",
              species: input.species.trim() || "Animals",
              count: Math.max(0, input.count),
              location: input.location.trim(),
              notes: input.notes || "",
              updatedAt: new Date().toISOString(),
            }
          : group,
      ),
    }));
  }, []);

  const adjustGroupCount = useCallback((groupId: string, nextCount: number, note?: string) => {
    setData((current) => {
      const group = current.groups.find((entry) => entry.id === groupId);
      if (!group) return current;
      const boundedCount = Math.max(0, nextCount);
      const now = new Date().toISOString();
      const event: AnimalEvent = {
        id: makeId("animal-event"),
        groupId,
        eventType: "note",
        date: todayDate(),
        quantityValue: boundedCount,
        unit: "animals",
        notes: [`Count adjusted from ${group.count} to ${boundedCount}.`, note?.trim()].filter(Boolean).join(" "),
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...current,
        groups: current.groups.map((entry) => (entry.id === groupId ? { ...entry, count: boundedCount, updatedAt: now } : entry)),
        events: [event, ...current.events],
      };
    });
  }, []);

  const addIndividual = useCallback((input: IndividualAnimalInput) => {
    const now = new Date().toISOString();
    const animal: IndividualAnimal = {
      ...input,
      id: makeId("animal"),
      groupId: input.groupId || undefined,
      name: input.name.trim() || "Unnamed animal",
      species: input.species.trim() || "Animals",
      breed: input.breed?.trim() || "",
      sex: input.sex?.trim() || "",
      birthHatchDate: input.birthHatchDate || "",
      acquiredDate: input.acquiredDate || "",
      location: input.location.trim(),
      notes: input.notes || "",
      photoPlaceholder: input.photoPlaceholder || "",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, individuals: [animal, ...current.individuals] }));
    return animal;
  }, []);

  const updateIndividual = useCallback((animalId: string, input: IndividualAnimalInput) => {
    setData((current) => ({
      ...current,
      individuals: current.individuals.map((animal) =>
        animal.id === animalId
          ? {
              ...animal,
              ...input,
              groupId: input.groupId || undefined,
              name: input.name.trim() || "Unnamed animal",
              species: input.species.trim() || "Animals",
              breed: input.breed?.trim() || "",
              sex: input.sex?.trim() || "",
              birthHatchDate: input.birthHatchDate || "",
              acquiredDate: input.acquiredDate || "",
              location: input.location.trim(),
              notes: input.notes || "",
              photoPlaceholder: input.photoPlaceholder || "",
              updatedAt: new Date().toISOString(),
            }
          : animal,
      ),
    }));
  }, []);

  const addEvent = useCallback((input: AnimalEventInput) => {
    const now = new Date().toISOString();
    const event: AnimalEvent = {
      ...input,
      id: makeId("animal-event"),
      groupId: input.groupId || undefined,
      animalId: input.animalId || undefined,
      date: input.date || todayDate(),
      unit: input.unit?.trim() || "",
      notes: input.notes || "",
      followUpDate: input.followUpDate || "",
      linkedChoreId: input.linkedChoreId || "",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, events: [event, ...current.events] }));
    return event;
  }, []);

  const addFeedRecord = useCallback((input: FeedRecordInput) => {
    const now = new Date().toISOString();
    const record: FeedRecord = {
      ...input,
      id: makeId("feed"),
      groupId: input.groupId || undefined,
      animalId: input.animalId || undefined,
      feedType: input.feedType.trim() || "Feed",
      amount: Math.max(0, input.amount),
      unit: input.unit.trim(),
      date: input.date || todayDate(),
      cost: input.cost === undefined ? undefined : Math.max(0, input.cost),
      notes: input.notes || "",
      createdAt: now,
      updatedAt: now,
    };
    const event: AnimalEvent = {
      id: makeId("animal-event"),
      groupId: record.groupId,
      animalId: record.animalId,
      eventType: "feeding",
      date: record.date,
      quantityValue: record.amount,
      unit: record.unit,
      notes: [record.feedType, record.notes].filter(Boolean).join(" - "),
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, feedRecords: [record, ...current.feedRecords], events: [event, ...current.events] }));
    return record;
  }, []);

  const addProductionRecord = useCallback((input: ProductionRecordInput) => {
    const now = new Date().toISOString();
    const record: ProductionRecord = {
      ...input,
      id: makeId("production"),
      groupId: input.groupId || undefined,
      animalId: input.animalId || undefined,
      quantity: Math.max(0, input.quantity),
      unit: input.unit.trim(),
      date: input.date || todayDate(),
      notes: input.notes || "",
      createdAt: now,
      updatedAt: now,
    };
    const event: AnimalEvent = {
      id: makeId("animal-event"),
      groupId: record.groupId,
      animalId: record.animalId,
      eventType: productionEventType(record.productionType),
      date: record.date,
      quantityValue: record.quantity,
      unit: record.unit,
      notes: [`${productionTypeLabel(record.productionType)} to ${productionDestinationLabel(record.destination)}`, record.notes].filter(Boolean).join(" - "),
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, productionRecords: [record, ...current.productionRecords], events: [event, ...current.events] }));
    return record;
  }, []);

  const addCareReminder = useCallback((input: CareReminderInput) => {
    const now = new Date().toISOString();
    const reminder: CareReminder = {
      ...input,
      id: makeId("animal-reminder"),
      groupId: input.groupId || undefined,
      animalId: input.animalId || undefined,
      title: input.title.trim() || "Care reminder",
      suggestedCadence: input.suggestedCadence.trim(),
      nextDueDate: input.nextDueDate || todayDate(),
      notes: input.notes || "",
      choreIntegrationStatus: "placeholder",
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, careReminders: [reminder, ...current.careReminders] }));
    return reminder;
  }, []);

  const updateCareReminder = useCallback((reminderId: string, input: CareReminderInput) => {
    setData((current) => ({
      ...current,
      careReminders: current.careReminders.map((reminder) =>
        reminder.id === reminderId
          ? {
              ...reminder,
              ...input,
              groupId: input.groupId || undefined,
              animalId: input.animalId || undefined,
              title: input.title.trim() || "Care reminder",
              suggestedCadence: input.suggestedCadence.trim(),
              nextDueDate: input.nextDueDate || todayDate(),
              notes: input.notes || "",
              choreIntegrationStatus: "placeholder",
              updatedAt: new Date().toISOString(),
            }
          : reminder,
      ),
    }));
  }, []);

  const value = useMemo<AnimalsContextValue>(
    () => ({
      data,
      addGroup,
      updateGroup,
      adjustGroupCount,
      addIndividual,
      updateIndividual,
      addEvent,
      addFeedRecord,
      addProductionRecord,
      addCareReminder,
      updateCareReminder,
    }),
    [data, addGroup, updateGroup, adjustGroupCount, addIndividual, updateIndividual, addEvent, addFeedRecord, addProductionRecord, addCareReminder, updateCareReminder],
  );

  return <AnimalsContext.Provider value={value}>{children}</AnimalsContext.Provider>;
}

export function useAnimals(): AnimalsContextValue {
  const context = useContext(AnimalsContext);
  if (!context) throw new Error("useAnimals must be used inside AnimalsProvider");
  return context;
}

export function useAnimalGroup(groupId?: string): AnimalGroup | undefined {
  const { data } = useAnimals();
  return data.groups.find((group) => group.id === groupId);
}

export function useIndividualAnimal(animalId?: string): IndividualAnimal | undefined {
  const { data } = useAnimals();
  return data.individuals.find((animal) => animal.id === animalId);
}

function productionEventType(productionType: ProductionType): AnimalEventType {
  if (productionType === "eggs") return "egg production";
  if (productionType === "milk") return "milk production";
  if (productionType === "meat") return "processing";
  return "note";
}

