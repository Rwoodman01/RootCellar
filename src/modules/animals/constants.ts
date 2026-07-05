import type { AnimalEventType, AnimalPurpose, AnimalStatus, ProductionDestination, ProductionType } from "./types";

export const ANIMAL_PURPOSE_OPTIONS: Array<{ value: AnimalPurpose; label: string }> = [
  { value: "eggs", label: "Eggs" },
  { value: "meat", label: "Meat" },
  { value: "milk", label: "Milk" },
  { value: "breeding", label: "Breeding" },
  { value: "fiber", label: "Fiber" },
  { value: "work/guardian", label: "Work or guardian" },
  { value: "pets/companions", label: "Pets or companions" },
  { value: "other", label: "Other" },
];

export const ANIMAL_STATUS_OPTIONS: Array<{ value: AnimalStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "retired", label: "Retired" },
  { value: "processed", label: "Processed" },
  { value: "sold", label: "Sold" },
  { value: "deceased", label: "Deceased" },
  { value: "other", label: "Other" },
];

export const ANIMAL_EVENT_OPTIONS: Array<{ value: AnimalEventType; label: string }> = [
  { value: "feeding", label: "Feeding" },
  { value: "health", label: "Health" },
  { value: "medication", label: "Medication" },
  { value: "vaccine", label: "Vaccine" },
  { value: "worming", label: "Worming" },
  { value: "injury", label: "Injury" },
  { value: "birth/hatch", label: "Birth or hatch" },
  { value: "breeding", label: "Breeding" },
  { value: "pregnancy/kidding/calving/lambing", label: "Pregnancy, kidding, calving, or lambing" },
  { value: "egg production", label: "Egg production" },
  { value: "milk production", label: "Milk production" },
  { value: "weight", label: "Weight" },
  { value: "processing", label: "Processing" },
  { value: "sold", label: "Sold" },
  { value: "death/loss", label: "Death or loss" },
  { value: "move/location", label: "Move or location" },
  { value: "note", label: "Note" },
  { value: "other", label: "Other" },
];

export const PRODUCTION_TYPE_OPTIONS: Array<{ value: ProductionType; label: string }> = [
  { value: "eggs", label: "Eggs" },
  { value: "milk", label: "Milk" },
  { value: "meat", label: "Meat" },
  { value: "fiber", label: "Fiber" },
  { value: "honey", label: "Honey" },
  { value: "other", label: "Other" },
];

export const PRODUCTION_DESTINATION_OPTIONS: Array<{ value: ProductionDestination; label: string }> = [
  { value: "pantry", label: "Pantry" },
  { value: "fresh use", label: "Fresh use" },
  { value: "sold", label: "Sold" },
  { value: "gifted", label: "Gifted" },
  { value: "fed to animals", label: "Fed to animals" },
  { value: "other", label: "Other" },
];

export const ANIMAL_SEX_OPTIONS = ["", "female", "male", "wether", "neutered", "unknown"];

export interface SpeciesTemplate {
  id: string;
  label: string;
  name: string;
  species: string;
  purpose: AnimalPurpose;
  count: number;
  location: string;
  notes: string;
}

export const SPECIES_TEMPLATES: SpeciesTemplate[] = [
  {
    id: "laying-hens",
    label: "Laying hens",
    name: "Laying flock",
    species: "Chickens",
    purpose: "eggs",
    count: 12,
    location: "Coop",
    notes: "Track egg counts, feed changes, worming, molts, broody hens, losses, and coop moves.",
  },
  {
    id: "meat-birds",
    label: "Meat birds",
    name: "Meat bird batch",
    species: "Chickens",
    purpose: "meat",
    count: 25,
    location: "Brooder",
    notes: "Track brooder moves, feed, weight checks, processing date, and losses.",
  },
  {
    id: "goats",
    label: "Goats",
    name: "Goat herd",
    species: "Goats",
    purpose: "milk",
    count: 2,
    location: "Goat pen",
    notes: "Track hoof trims, minerals, worming, breeding notes, kidding, milk, and health events.",
  },
  {
    id: "dairy-cow",
    label: "Dairy cow",
    name: "Dairy cow",
    species: "Cattle",
    purpose: "milk",
    count: 1,
    location: "Pasture",
    notes: "Track milking, feed, breeding notes, calving, health events, and location moves.",
  },
  {
    id: "rabbits",
    label: "Rabbits",
    name: "Rabbit colony",
    species: "Rabbits",
    purpose: "breeding",
    count: 4,
    location: "Rabbitry",
    notes: "Track kindling, feed, colony moves, health checks, processing, sales, and losses.",
  },
  {
    id: "pigs",
    label: "Pigs",
    name: "Pig group",
    species: "Pigs",
    purpose: "meat",
    count: 2,
    location: "Pig paddock",
    notes: "Track feed, pasture moves, weights, processing, and health events.",
  },
  {
    id: "bees",
    label: "Bees",
    name: "Bee yard",
    species: "Bees",
    purpose: "other",
    count: 2,
    location: "Apiary",
    notes: "Track inspections, feeding, mite checks, queen notes, honey, splits, and winter losses.",
  },
  {
    id: "sheep",
    label: "Sheep",
    name: "Sheep flock",
    species: "Sheep",
    purpose: "fiber",
    count: 4,
    location: "Sheep pasture",
    notes: "Track shearing, lambing, pasture moves, worming, hoof trims, and health events.",
  },
];

export function purposeLabel(purpose?: AnimalPurpose): string {
  return ANIMAL_PURPOSE_OPTIONS.find((option) => option.value === purpose)?.label || "Other";
}

export function statusLabel(status?: AnimalStatus): string {
  return ANIMAL_STATUS_OPTIONS.find((option) => option.value === status)?.label || "Other";
}

export function eventTypeLabel(eventType?: AnimalEventType): string {
  return ANIMAL_EVENT_OPTIONS.find((option) => option.value === eventType)?.label || "Other";
}

export function productionTypeLabel(productionType?: ProductionType): string {
  return PRODUCTION_TYPE_OPTIONS.find((option) => option.value === productionType)?.label || "Other";
}

export function productionDestinationLabel(destination?: ProductionDestination): string {
  return PRODUCTION_DESTINATION_OPTIONS.find((option) => option.value === destination)?.label || "Other";
}

export const ANIMAL_PURPOSE_VALUES = ANIMAL_PURPOSE_OPTIONS.map((option) => option.value);
export const ANIMAL_STATUS_VALUES = ANIMAL_STATUS_OPTIONS.map((option) => option.value);
export const ANIMAL_EVENT_VALUES = ANIMAL_EVENT_OPTIONS.map((option) => option.value);
export const PRODUCTION_TYPE_VALUES = PRODUCTION_TYPE_OPTIONS.map((option) => option.value);
export const PRODUCTION_DESTINATION_VALUES = PRODUCTION_DESTINATION_OPTIONS.map((option) => option.value);

