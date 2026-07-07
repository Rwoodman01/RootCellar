import type { LucideIcon } from "lucide-react";

export type ModuleStatus = "active" | "coming-soon";
export type ModuleKind = "room" | "rhythm" | "hidden";

export interface RootcellarModule {
  id: string;
  name: string;
  path: string;
  status: ModuleStatus;
  kind: ModuleKind;
  promise: string;
  detail: string;
  icon: LucideIcon;
}
