import {
  ClipboardCheck,
  ClipboardList,
  HandHeart,
  MessageCircle,
  Package,
  PawPrint,
  Sprout,
  Wheat,
} from "lucide-react";
import type { RootcellarModule } from "./shared/types/modules";

export const rootcellarModules: RootcellarModule[] = [
  {
    id: "daily-bread",
    name: "Daily Bread",
    path: "/daily-bread",
    status: "active",
    kind: "rhythm",
    promise: "A short daily check for what the household needs to carry.",
    detail: "Owned work, due chores, care, garden, pantry, preservation, and reflection.",
    icon: Wheat,
  },
  {
    id: "preservation",
    name: "Preservation",
    path: "/preservation",
    status: "active",
    kind: "room",
    promise: "Plan the jars before harvest crowds the kitchen.",
    detail: "Canning season, freezer space, sessions, and supplies.",
    icon: ClipboardList,
  },
  {
    id: "pantry",
    name: "Pantry",
    path: "/pantry",
    status: "active",
    kind: "room",
    promise: "What is put away, where it sits, and what to eat first.",
    detail: "Products, batches, locations, and one-tap deduction.",
    icon: Package,
  },
  {
    id: "garden",
    name: "Garden",
    path: "/garden",
    status: "active",
    kind: "room",
    promise: "Beds, crops, starts, harvest notes, and seasonal memory.",
    detail: "Food targets, beds, plantings, harvests, varieties, and seed packets.",
    icon: Sprout,
  },
  {
    id: "animals",
    name: "Animals",
    path: "/animals",
    status: "active",
    kind: "room",
    promise: "Care logs, feed notes, health records, production, and living timelines.",
    detail: "Groups, individuals, events, feed, production, and care reminders.",
    icon: PawPrint,
  },
  {
    id: "chores",
    name: "Chores",
    path: "/chores",
    status: "active",
    kind: "room",
    promise: "Who owns what, what is ripe, and what belongs in the Huddle.",
    detail: "Fixed, decay, condition, season-anchored, and burst/project work.",
    icon: ClipboardCheck,
  },
  {
    id: "huddle",
    name: "Weekly Huddle",
    path: "/huddle",
    status: "active",
    kind: "rhythm",
    promise: "Around the table: what worked, what slipped, and what needs carrying next.",
    detail: "Pulse, priorities, owned work, stuck list, decisions, and next week focus.",
    icon: HandHeart,
  },
  {
    id: "ask",
    name: "Ask Rootcellar",
    path: "/ask",
    status: "coming-soon",
    kind: "hidden",
    promise: "Answers over your own household records.",
    detail: "Not built yet. No AI in alpha.",
    icon: MessageCircle,
  },
];

export const roomModules: RootcellarModule[] = rootcellarModules.filter((module) => module.kind === "room");

export function findModuleByPath(pathname: string): RootcellarModule | undefined {
  return rootcellarModules.find((module) => pathname === module.path);
}
