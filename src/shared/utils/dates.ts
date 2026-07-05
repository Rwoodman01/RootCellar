export function formatShortDate(dateValue?: string): string {
  if (!dateValue) return "Unscheduled";

  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Unscheduled";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function currentYear(): number {
  return new Date().getFullYear();
}
