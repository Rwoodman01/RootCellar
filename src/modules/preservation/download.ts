import type { PreservationPlan } from "./types";

export function downloadPlan(plan: PreservationPlan) {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${plan.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "rootcellar-plan"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
