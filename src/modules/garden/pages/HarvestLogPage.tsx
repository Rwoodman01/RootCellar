import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { HARVEST_DESTINATIONS, harvestDestinationLabel } from "../constants";
import { plantingLabel } from "../gardenUtils";
import type { HarvestDestination, HarvestInput } from "../types";
import { useGarden } from "../useGarden";

export function HarvestLogPage() {
  const { data, addHarvest, deleteHarvest } = useGarden();
  const firstPlanting = data.plantings[0];
  const [form, setForm] = useState<HarvestInput>({
    plantingId: firstPlanting?.id || "",
    quantity: 1,
    unit: "pounds",
    date: new Date().toISOString().slice(0, 10),
    destination: "fresh",
    preservationBatchLink: "",
    pantryBatchLink: "",
    notes: "",
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.plantingId) return;
    addHarvest(form);
    setForm((current) => ({ ...current, quantity: 1, notes: "" }));
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Harvest log" title="What actually came in">
        <p>Harvests connect real garden output to fresh eating, preservation, pantry storage, and next year's planning memory.</p>
      </PageHeader>
      <form className="form-panel" onSubmit={submit}>
        <div className="form-grid">
          <label>Planting<select value={form.plantingId} onChange={(event) => setForm({ ...form, plantingId: event.target.value })} required><option value="">Choose planting</option>{data.plantings.map((planting) => <option key={planting.id} value={planting.id}>{plantingLabel(planting, data.varieties)}</option>)}</select></label>
          <label>Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
          <label>Quantity<input type="number" min="0" step="0.1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} /></label>
          <label>Unit<input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="pounds, quarts, bunches" /></label>
          <label>Destination<select value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value as HarvestDestination })}>{HARVEST_DESTINATIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          {(form.destination === "preserved" || form.destination === "pantry") ? <label>Future link placeholder<input value={form.destination === "preserved" ? form.preservationBatchLink || "" : form.pantryBatchLink || ""} onChange={(event) => setForm(form.destination === "preserved" ? { ...form, preservationBatchLink: event.target.value } : { ...form, pantryBatchLink: event.target.value })} placeholder="Batch link coming later" /></label> : null}
        </div>
        <label>Notes<textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <Button type="submit"><Plus size={18} />Add harvest</Button>
      </form>
      <section className="plan-list">
        {data.harvests.map((harvest) => {
          const planting = data.plantings.find((entry) => entry.id === harvest.plantingId);
          return <article className="garden-record-row" key={harvest.id}><div><span>{formatShortDate(harvest.date)} · {harvestDestinationLabel(harvest.destination)}</span><strong>{harvest.quantity} {harvest.unit} {planting ? `from ${plantingLabel(planting, data.varieties)}` : ""}</strong><small>{harvest.notes || "No notes"}</small></div><Button type="button" variant="ghost" onClick={() => deleteHarvest(harvest.id)} aria-label="Delete harvest"><Trash2 size={18} /></Button></article>;
        })}
      </section>
    </div>
  );
}
