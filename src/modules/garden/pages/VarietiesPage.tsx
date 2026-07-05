import { FormEvent, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { cropDefaultsFor } from "../constants";
import type { GrowAgainFlag, VarietyInput } from "../types";
import { useGarden } from "../useGarden";

const emptyVariety: VarietyInput = { crop: "Tomato", name: "", source: "", packetDtm: 78, germinationNotes: "", flavorRating: 0, diseaseNotes: "", growAgain: "maybe", notes: "" };

export function VarietiesPage() {
  const { data, addVariety, updateVariety, deleteVariety } = useGarden();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VarietyInput>(emptyVariety);
  const editing = data.varieties.find((variety) => variety.id === editingId);

  const edit = (id: string) => {
    const variety = data.varieties.find((entry) => entry.id === id);
    if (!variety) return;
    setEditingId(id);
    setForm({ crop: variety.crop, name: variety.name, source: variety.source, packetDtm: variety.packetDtm, germinationNotes: variety.germinationNotes, flavorRating: variety.flavorRating, diseaseNotes: variety.diseaseNotes, growAgain: variety.growAgain, notes: variety.notes });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editing) updateVariety(editing.id, form);
    else addVariety(form);
    setEditingId(null);
    setForm(emptyVariety);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Varieties" title="What earned a place next year">
        <p>Keep packet DTM, flavor notes, disease notes, and the blunt grow-again decision close to the planting record.</p>
      </PageHeader>
      <form className="form-panel" onSubmit={submit}>
        <div className="form-grid">
          <label>Crop<input value={form.crop} onChange={(event) => {
            const crop = event.target.value;
            setForm({ ...form, crop, packetDtm: cropDefaultsFor(crop).defaultDtm });
          }} required /></label>
          <label>Variety name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required placeholder="Amish Paste" /></label>
          <label>Source<input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} placeholder="Seed company, neighbor, saved seed" /></label>
          <label>Packet DTM<input type="number" min="0" value={form.packetDtm} onChange={(event) => setForm({ ...form, packetDtm: Number(event.target.value) })} /></label>
          <label>Flavor rating<input type="number" min="0" max="5" value={form.flavorRating} onChange={(event) => setForm({ ...form, flavorRating: Number(event.target.value) })} /></label>
          <label>Grow again<select value={form.growAgain} onChange={(event) => setForm({ ...form, growAgain: event.target.value as GrowAgainFlag })}><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select></label>
        </div>
        <label>Germination notes<textarea rows={2} value={form.germinationNotes} onChange={(event) => setForm({ ...form, germinationNotes: event.target.value })} /></label>
        <label>Disease notes<textarea rows={2} value={form.diseaseNotes} onChange={(event) => setForm({ ...form, diseaseNotes: event.target.value })} /></label>
        <label>Notes<textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <div className="button-row">
          <Button type="submit"><Save size={18} />{editing ? "Save variety" : "Add variety"}</Button>
          {editing ? <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyVariety); }}>Cancel</Button> : null}
        </div>
      </form>
      <section className="plan-list">
        {data.varieties.map((variety) => {
          const harvestDates = data.plantings.filter((planting) => planting.varietyId === variety.id && planting.firstHarvestDate).map((planting) => planting.firstHarvestDate);
          return <article className="garden-record-row" key={variety.id}><div><span>{variety.crop} · grow again: {variety.growAgain}</span><strong>{variety.name}</strong><small>Packet DTM {variety.packetDtm || cropDefaultsFor(variety.crop).defaultDtm} · actual DTM {harvestDates.length ? "logged in plantings" : "not enough logs yet"} · flavor {variety.flavorRating || "unrated"}/5</small></div><div className="item-actions"><Button type="button" variant="secondary" onClick={() => edit(variety.id)}>Edit</Button><Button type="button" variant="ghost" onClick={() => deleteVariety(variety.id)} aria-label={`Delete ${variety.name}`}><Trash2 size={18} /></Button></div></article>;
        })}
      </section>
    </div>
  );
}

