export type AnimalPurpose = "eggs" | "meat" | "milk" | "breeding" | "fiber" | "work/guardian" | "pets/companions" | "other";

export type AnimalStatus = "active" | "retired" | "processed" | "sold" | "deceased" | "other";

export type AnimalEventType =
  | "feeding"
  | "health"
  | "medication"
  | "vaccine"
  | "worming"
  | "injury"
  | "birth/hatch"
  | "breeding"
  | "pregnancy/kidding/calving/lambing"
  | "egg production"
  | "milk production"
  | "weight"
  | "processing"
  | "sold"
  | "death/loss"
  | "move/location"
  | "note"
  | "other";

export type ProductionType = "eggs" | "milk" | "meat" | "fiber" | "honey" | "other";

export type ProductionDestination = "pantry" | "fresh use" | "sold" | "gifted" | "fed to animals" | "other";

export type CareReminderIntegrationStatus = "placeholder";

export interface AnimalGroup {
  id: string;
  name: string;
  species: string;
  purpose: AnimalPurpose;
  count: number;
  location: string;
  startDate: string;
  status: AnimalStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndividualAnimal {
  id: string;
  groupId?: string;
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  birthHatchDate?: string;
  acquiredDate?: string;
  purpose: AnimalPurpose;
  status: AnimalStatus;
  location: string;
  notes: string;
  photoPlaceholder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalEvent {
  id: string;
  animalId?: string;
  groupId?: string;
  eventType: AnimalEventType;
  date: string;
  quantityValue?: number;
  unit?: string;
  notes: string;
  followUpDate?: string;
  linkedChoreId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedRecord {
  id: string;
  groupId?: string;
  animalId?: string;
  feedType: string;
  amount: number;
  unit: string;
  date: string;
  cost?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionRecord {
  id: string;
  groupId?: string;
  animalId?: string;
  productionType: ProductionType;
  quantity: number;
  unit: string;
  date: string;
  destination: ProductionDestination;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareReminder {
  id: string;
  title: string;
  animalId?: string;
  groupId?: string;
  suggestedCadence: string;
  nextDueDate: string;
  notes: string;
  choreIntegrationStatus: CareReminderIntegrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalData {
  groups: AnimalGroup[];
  individuals: IndividualAnimal[];
  events: AnimalEvent[];
  feedRecords: FeedRecord[];
  productionRecords: ProductionRecord[];
  careReminders: CareReminder[];
}

export type AnimalGroupInput = Omit<AnimalGroup, "id" | "createdAt" | "updatedAt">;
export type IndividualAnimalInput = Omit<IndividualAnimal, "id" | "createdAt" | "updatedAt">;
export type AnimalEventInput = Omit<AnimalEvent, "id" | "createdAt" | "updatedAt">;
export type FeedRecordInput = Omit<FeedRecord, "id" | "createdAt" | "updatedAt">;
export type ProductionRecordInput = Omit<ProductionRecord, "id" | "createdAt" | "updatedAt">;
export type CareReminderInput = Omit<CareReminder, "id" | "createdAt" | "updatedAt" | "choreIntegrationStatus">;

