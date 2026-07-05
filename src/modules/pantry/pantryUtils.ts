import type { PantryBatch, PantryData, PantryProduct, PantryTransaction } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function addMonths(dateValue: string, months: number): string {
  const date = new Date(`${dateValue || today()}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateValue?: string): number | null {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date(`${today()}T12:00:00`);
  return Math.ceil((date.getTime() - now.getTime()) / DAY_MS);
}

export function batchSortDate(batch: PantryBatch): string {
  return batch.datePreserved || batch.dateFrozen || batch.datePacked || batch.dateAdded;
}

export function getProductTotal(productId: string, batches: PantryBatch[]): number {
  return batches.filter((batch) => batch.productId === productId).reduce((sum, batch) => sum + Math.max(0, batch.quantity), 0);
}

export function getOpenBatches(productId: string, batches: PantryBatch[]): PantryBatch[] {
  return batches
    .filter((batch) => batch.productId === productId && batch.quantity > 0)
    .sort((a, b) => batchSortDate(a).localeCompare(batchSortDate(b)) || (a.eatByDate || "").localeCompare(b.eatByDate || ""));
}

export function getEatFirstBatches(data: PantryData): PantryBatch[] {
  return [...data.batches]
    .filter((batch) => batch.quantity > 0)
    .sort((a, b) => {
      const eatBy = (a.eatByDate || "9999").localeCompare(b.eatByDate || "9999");
      return eatBy || batchSortDate(a).localeCompare(batchSortDate(b));
    })
    .slice(0, 10);
}

export function getUseSoonBatches(data: PantryData, withinDays = 60): PantryBatch[] {
  return data.batches
    .filter((batch) => {
      const remaining = daysUntil(batch.eatByDate);
      return batch.quantity > 0 && remaining !== null && remaining <= withinDays;
    })
    .sort((a, b) => (a.eatByDate || "").localeCompare(b.eatByDate || ""));
}

export function getLowStockProducts(data: PantryData): PantryProduct[] {
  return data.products.filter((product) => getProductTotal(product.id, data.batches) <= product.lowStockThreshold);
}

export function getRunwayLine(product: PantryProduct, data: PantryData): string {
  const batchIds = data.batches.filter((batch) => batch.productId === product.id).map((batch) => batch.id);
  const cutoff = Date.now() - 90 * DAY_MS;
  const uses = data.transactions.filter((transaction) => {
    const occurred = new Date(transaction.occurredAt).getTime();
    return batchIds.includes(transaction.batchId) && transaction.delta < 0 && occurred >= cutoff;
  });

  if (uses.length < 3) return "Not enough usage history yet";

  const used = Math.abs(uses.reduce((sum, transaction) => sum + transaction.delta, 0));
  const monthlyRate = used / 3;
  const total = getProductTotal(product.id, data.batches);
  if (monthlyRate <= 0 || total <= 0) return "Not enough usage history yet";

  const monthsLeft = total / monthlyRate;
  const emptyDate = new Date();
  emptyDate.setMonth(emptyDate.getMonth() + Math.max(1, Math.round(monthsLeft)));
  const emptyBy = new Intl.DateTimeFormat("en", { month: "short" }).format(emptyDate);
  return `${formatQuantity(total)} left at about ${monthlyRate.toFixed(monthlyRate >= 10 ? 0 : 1)}/month. Empty by ${emptyBy}.`;
}

export function getProductInsight(product: PantryProduct, data: PantryData): string {
  const open = getOpenBatches(product.id, data.batches);
  if (!open.length) return "No open batches";
  const oldest = open[0];
  const newest = open[open.length - 1];
  if (open.length > 1 && batchSortDate(oldest).slice(0, 4) !== batchSortDate(newest).slice(0, 4)) {
    return `Eat first: ${oldest.quantity} ${oldest.unit} from ${batchSortDate(oldest).slice(0, 4)} still stored.`;
  }
  return getRunwayLine(product, data);
}

export function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
