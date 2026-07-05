import { eventTypeLabel, productionDestinationLabel, productionTypeLabel } from "./constants";
import type { AnimalData, AnimalEvent, AnimalGroup, CareReminder, FeedRecord, IndividualAnimal, ProductionRecord } from "./types";

export type AnimalTarget =
  | { type: "group"; id: string; label: string; species: string }
  | { type: "animal"; id: string; label: string; species: string };

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function sortedEvents(events: AnimalEvent[]): AnimalEvent[] {
  return [...events].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function sortedReminders(reminders: CareReminder[]): CareReminder[] {
  return [...reminders].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
}

export function sortedFeedRecords(records: FeedRecord[]): FeedRecord[] {
  return [...records].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function sortedProductionRecords(records: ProductionRecord[]): ProductionRecord[] {
  return [...records].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function getAnimalTargets(data: AnimalData): AnimalTarget[] {
  return [
    ...data.groups.map((group) => ({ type: "group" as const, id: group.id, label: group.name, species: group.species })),
    ...data.individuals.map((animal) => ({ type: "animal" as const, id: animal.id, label: animal.name, species: animal.species })),
  ];
}

export function targetValue(target: Pick<AnimalEvent, "groupId" | "animalId">): string {
  if (target.animalId) return `animal:${target.animalId}`;
  if (target.groupId) return `group:${target.groupId}`;
  return "";
}

export function parseTargetValue(value: string): Pick<AnimalEvent, "groupId" | "animalId"> {
  const [type, id] = value.split(":");
  if (!id) return {};
  if (type === "animal") return { animalId: id };
  if (type === "group") return { groupId: id };
  return {};
}

export function targetLabel(data: AnimalData, target: Pick<AnimalEvent, "groupId" | "animalId">): string {
  if (target.animalId) {
    const animal = data.individuals.find((entry) => entry.id === target.animalId);
    return animal ? animal.name : "Removed animal";
  }
  if (target.groupId) {
    const group = data.groups.find((entry) => entry.id === target.groupId);
    return group ? group.name : "Removed group";
  }
  return "Animal log";
}

export function targetSpecies(data: AnimalData, target: Pick<AnimalEvent, "groupId" | "animalId">): string {
  if (target.animalId) return data.individuals.find((entry) => entry.id === target.animalId)?.species || "";
  if (target.groupId) return data.groups.find((entry) => entry.id === target.groupId)?.species || "";
  return "";
}

export function groupIndividuals(data: AnimalData, groupId: string): IndividualAnimal[] {
  return data.individuals.filter((animal) => animal.groupId === groupId);
}

export function groupEvents(data: AnimalData, groupId: string): AnimalEvent[] {
  const individualIds = groupIndividuals(data, groupId).map((animal) => animal.id);
  return sortedEvents(data.events.filter((event) => event.groupId === groupId || (event.animalId ? individualIds.includes(event.animalId) : false)));
}

export function individualEvents(data: AnimalData, animalId: string): AnimalEvent[] {
  return sortedEvents(data.events.filter((event) => event.animalId === animalId));
}

export function groupFeedRecords(data: AnimalData, groupId: string): FeedRecord[] {
  const individualIds = groupIndividuals(data, groupId).map((animal) => animal.id);
  return sortedFeedRecords(data.feedRecords.filter((record) => record.groupId === groupId || (record.animalId ? individualIds.includes(record.animalId) : false)));
}

export function individualFeedRecords(data: AnimalData, animalId: string): FeedRecord[] {
  return sortedFeedRecords(data.feedRecords.filter((record) => record.animalId === animalId));
}

export function groupProductionRecords(data: AnimalData, groupId: string): ProductionRecord[] {
  const individualIds = groupIndividuals(data, groupId).map((animal) => animal.id);
  return sortedProductionRecords(
    data.productionRecords.filter((record) => record.groupId === groupId || (record.animalId ? individualIds.includes(record.animalId) : false)),
  );
}

export function individualProductionRecords(data: AnimalData, animalId: string): ProductionRecord[] {
  return sortedProductionRecords(data.productionRecords.filter((record) => record.animalId === animalId));
}

export function groupCareReminders(data: AnimalData, groupId: string): CareReminder[] {
  const individualIds = groupIndividuals(data, groupId).map((animal) => animal.id);
  return sortedReminders(data.careReminders.filter((reminder) => reminder.groupId === groupId || (reminder.animalId ? individualIds.includes(reminder.animalId) : false)));
}

export function individualCareReminders(data: AnimalData, animalId: string): CareReminder[] {
  return sortedReminders(data.careReminders.filter((reminder) => reminder.animalId === animalId));
}

export function activeGroups(groups: AnimalGroup[]): AnimalGroup[] {
  return groups.filter((group) => group.status === "active");
}

export function activeIndividuals(individuals: IndividualAnimal[]): IndividualAnimal[] {
  return individuals.filter((animal) => animal.status === "active");
}

export function dueCareReminders(reminders: CareReminder[], date = todayDate()): CareReminder[] {
  return sortedReminders(reminders.filter((reminder) => reminder.nextDueDate <= date));
}

export function dueFollowUps(events: AnimalEvent[], date = todayDate()): AnimalEvent[] {
  return sortedEvents(events.filter((event) => event.followUpDate && event.followUpDate <= date));
}

export function recentProductionSummary(records: ProductionRecord[], days = 30): string[] {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const recent = records.filter((record) => new Date(`${record.date}T12:00:00`) >= since);
  const totals = new Map<string, number>();

  recent.forEach((record) => {
    const key = `${productionTypeLabel(record.productionType)}|${record.unit}`;
    totals.set(key, (totals.get(key) || 0) + record.quantity);
  });

  return [...totals.entries()].map(([key, quantity]) => {
    const [type, unit] = key.split("|");
    return `${quantity} ${unit || "units"} ${type.toLowerCase()}`;
  });
}

export function eventSummary(event: AnimalEvent): string {
  const quantity = event.quantityValue !== undefined ? `${event.quantityValue} ${event.unit || ""}`.trim() : "";
  return [eventTypeLabel(event.eventType), quantity].filter(Boolean).join(" - ");
}

export function feedSummary(record: FeedRecord): string {
  const cost = record.cost !== undefined ? ` - $${record.cost.toFixed(2)}` : "";
  return `${record.amount} ${record.unit} ${record.feedType}${cost}`;
}

export function productionSummary(record: ProductionRecord): string {
  return `${record.quantity} ${record.unit} ${productionTypeLabel(record.productionType).toLowerCase()} - ${productionDestinationLabel(record.destination)}`;
}

