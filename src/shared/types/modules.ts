import type { LucideIcon } from "lucide-react";

export type ModuleStatus = "active" | "coming-soon" | "hidden";

export interface RootcellarModule {
  id: string;
  name: string;
  path: string;
  status: ModuleStatus;
  promise: string;
  detail: string;
  icon: LucideIcon;
}
