import {
  ANIMAL_EVENT_VALUES,
  ANIMAL_PURPOSE_VALUES,
  ANIMAL_STATUS_VALUES,
  PRODUCTION_DESTINATION_VALUES,
  PRODUCTION_TYPE_VALUES,
} from "./constants";
import type {
  AnimalData,
  AnimalEvent,
  AnimalEventType,
  AnimalGroup,
  AnimalPurpose,
  AnimalStatus,
  CareReminder,
  FeedRecord,
  IndividualAnimal,
  ProductionDestination,
  ProductionRecord,
  ProductionType,
} from "./types";

export function createEmptyAnimalData(): AnimalData {
  return {
    groups: [],
    individuals: [],
    events: [],
    feedRecords: [],
    productionRecords: [],
    careReminders: [],
  };
}

export function ensureAnimalData(data?: Partial<AnimalData>): AnimalData {
  return {
    groups: Array.isArray(data?.groups) ? data.groups.map(ensureGroup) : [],
    individuals: Array.isArray(data?.individuals) ? data.individuals.map(ensureIndividual) : [],
    events: Array.isArray(data?.events) ? data.events.map(ensureEvent) : [],
    feedRecords: Array.isArray(data?.feedRecords) ? data.feedRecords.map(ensureFeedRecord) : [],
    productionRecords: Array.isArray(data?.productionRecords) ? data.productionRecords.map(ensureProductionRecord) : [],
    careReminders: Array.isArray(data?.careReminders) ? data.careReminders.map(ensureCareReminder) : [],
  };
}

function ensureGroup(group: Partial<AnimalGroup>): AnimalGroup {
  const now = new Date().toISOString();
  return {
    id: group.id || "",
    name: group.name || "Unnamed group",
    species: group.species || "Animals",
    purpose: ensurePurpose(group.purpose),
    count: Math.max(0, Number(group.count) || 0),
    location: group.location || "",
    startDate: group.startDate || todayDate(),
    status: ensureStatus(group.status),
    notes: group.notes || "",
    createdAt: group.createdAt || now,
    updatedAt: group.updatedAt || now,
  };
}

function ensureIndividual(animal: Partial<IndividualAnimal>): IndividualAnimal {
  const now = new Date().toISOString();
  return {
    id: animal.id || "",
    groupId: animal.groupId || undefined,
    name: animal.name || "Unnamed animal",
    species: animal.species || "Animals",
    breed: animal.breed || "",
    sex: animal.sex || "",
    birthHatchDate: animal.birthHatchDate || "",
    acquiredDate: animal.acquiredDate || "",
    purpose: ensurePurpose(animal.purpose),
    status: ensureStatus(animal.status),
    location: animal.location || "",
    notes: animal.notes || "",
    photoPlaceholder: animal.photoPlaceholder || "",
    createdAt: animal.createdAt || now,
    updatedAt: animal.updatedAt || now,
  };
}

function ensureEvent(event: Partial<AnimalEvent>): AnimalEvent {
  const now = new Date().toISOString();
  return {
    id: event.id || "",
    animalId: event.animalId || undefined,
    groupId: event.groupId || undefined,
    eventType: ensureEventType(event.eventType),
    date: event.date || todayDate(),
    quantityValue: event.quantityValue === undefined ? undefined : Math.max(0, Number(event.quantityValue) || 0),
    unit: event.unit || "",
    notes: event.notes || "",
    followUpDate: event.followUpDate || "",
    linkedChoreId: event.linkedChoreId || "",
    createdAt: event.createdAt || now,
    updatedAt: event.updatedAt || now,
  };
}

function ensureFeedRecord(record: Partial<FeedRecord>): FeedRecord {
  const now = new Date().toISOString();
  return {
    id: record.id || "",
    groupId: record.groupId || undefined,
    animalId: record.animalId || undefined,
    feedType: record.feedType || "Feed",
    amount: Math.max(0, Number(record.amount) || 0),
    unit: record.unit || "",
    date: record.date || todayDate(),
    cost: record.cost === undefined ? undefined : Math.max(0, Number(record.cost) || 0),
    notes: record.notes || "",
    createdAt: record.createdAt || now,
    updatedAt: record.updatedAt || now,
  };
}

function ensureProductionRecord(record: Partial<ProductionRecord>): ProductionRecord {
  const now = new Date().toISOString();
  return {
    id: record.id || "",
    groupId: record.groupId || undefined,
    animalId: record.animalId || undefined,
    productionType: ensureProductionType(record.productionType),
    quantity: Math.max(0, Number(record.quantity) || 0),
    unit: record.unit || "",
    date: record.date || todayDate(),
    destination: ensureProductionDestination(record.destination),
    notes: record.notes || "",
    createdAt: record.createdAt || now,
    updatedAt: record.updatedAt || now,
  };
}

function ensureCareReminder(reminder: Partial<CareReminder>): CareReminder {
  const now = new Date().toISOString();
  return {
    id: reminder.id || "",
    title: reminder.title || "Care reminder",
    animalId: reminder.animalId || undefined,
    groupId: reminder.groupId || undefined,
    suggestedCadence: reminder.suggestedCadence || "",
    nextDueDate: reminder.nextDueDate || todayDate(),
    notes: reminder.notes || "",
    choreIntegrationStatus: "placeholder",
    createdAt: reminder.createdAt || now,
    updatedAt: reminder.updatedAt || now,
  };
}

function ensurePurpose(value: unknown): AnimalPurpose {
  return ANIMAL_PURPOSE_VALUES.includes(value as AnimalPurpose) ? (value as AnimalPurpose) : "other";
}

function ensureStatus(value: unknown): AnimalStatus {
  return ANIMAL_STATUS_VALUES.includes(value as AnimalStatus) ? (value as AnimalStatus) : "active";
}

function ensureEventType(value: unknown): AnimalEventType {
  return ANIMAL_EVENT_VALUES.includes(value as AnimalEventType) ? (value as AnimalEventType) : "note";
}

function ensureProductionType(value: unknown): ProductionType {
  return PRODUCTION_TYPE_VALUES.includes(value as ProductionType) ? (value as ProductionType) : "other";
}

function ensureProductionDestination(value: unknown): ProductionDestination {
  return PRODUCTION_DESTINATION_VALUES.includes(value as ProductionDestination) ? (value as ProductionDestination) : "other";
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

