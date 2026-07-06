import { FormEvent, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { SUN_OPTIONS, cropFamily } from "../constants";
import { bedCapacityLabel, bedSquareFeet, bedUsedRowFeet, bedUsedSquareFeet } from "../calculations";
import { useGarden } from "../useGarden";
import type { BedInput, SunExposure } from "../types";

const emptyBed: BedInput = {
  name: "",
  areaName: "Main garden",
  planningMode: "square-feet",
  lengthFeet: 8,
  widthFeet: 4,
  rowFeetCapacity: 24,
  sun: "full-sun",
  soilNotes: "",
  notes: "",
};

export function BedsPage() {
  const { data, addBed, updateBed, deleteBed } = useGarden();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = data.beds.find((bed) => bed.id === editingId);
  const [form, setForm] = useState<BedInput>(emptyBed);

  const edit = (bedId: string) => {
    const bed = data.beds.find((entry) => entry.id === bedId);
    if (!bed) return;
    setEditingId(bedId);
    setForm({
      name: bed.name,
      areaName: bed.areaName,
      planningMode: bed.planningMode,
      lengthFeet: bed.lengthFeet,
      widthFeet: bed.widthFeet,
      rowFeetCapacity: bed.rowFeetCapacity,
      sun: bed.sun,
      soilNotes: bed.soilNotes,
      notes: bed.notes,
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editing) updateBed(editing.id, form);
    else addBed(form);
    setEditingId(null);
    setForm(emptyBed);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Garden beds" title="Beds, areas, and rough capacity">
        <p>No complex map required. A bed is a named place with enough capacity to make planting memory useful.</p>
      </PageHeader>

      <form className="form-panel" onSubmit={submit}>
        <div className="form-grid">
          <label>Bed name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required placeholder="North tomato bed" /></label>
          <label>Garden or area<input value={form.areaName} onChange={(event) => setForm({ ...form, areaName: event.target.value })} placeholder="Kitchen garden" /></label>
          <label>Planning style<select value={form.planningMode} onChange={(event) => setForm({ ...form, planningMode: event.target.value as BedInput["planningMode"] })}><option value="square-feet">Square-foot raised bed</option><option value="row-feet">Row-feet / field row</option></select></label>
          {form.planningMode === "square-feet" ? (
            <>
              <label>Length, feet<input type="number" min="0" step="0.5" value={form.lengthFeet} onChange={(event) => setForm({ ...form, lengthFeet: Number(event.target.value) })} /></label>
              <label>Width, feet<input type="number" min="0" step="0.5" value={form.widthFeet} onChange={(event) => setForm({ ...form, widthFeet: Number(event.target.value) })} /></label>
              <div className="readonly-metric">
                <span>Square-foot capacity</span>
                <strong>{Math.max(0, form.lengthFeet) * Math.max(0, form.widthFeet)} sq ft</strong>
              </div>
            </>
          ) : (
            <label>Row-feet capacity<input type="number" min="0" step="0.5" value={form.rowFeetCapacity} onChange={(event) => setForm({ ...form, rowFeetCapacity: Number(event.target.value) })} /></label>
          )}
          <label>Sun<select value={form.sun} onChange={(event) => setForm({ ...form, sun: event.target.value as SunExposure })}>{SUN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        </div>
        <label>Soil notes<textarea rows={3} value={form.soilNotes} onChange={(event) => setForm({ ...form, soilNotes: event.target.value })} /></label>
        <label>Notes<textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <div className="button-row">
          <Button type="submit"><Save size={18} />{editing ? "Save bed" : "Add bed"}</Button>
          {editing ? <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyBed); }}>Cancel</Button> : null}
        </div>
      </form>

      <section className="plan-list">
        {data.beds.map((bed) => {
          const plantings = data.plantings.filter((planting) => planting.bedId === bed.id);
          const history = Array.from(new Set(plantings.map((planting) => cropFamily(planting.crop))));
          return (
            <article className="garden-record-row" key={bed.id}>
              <div>
                <span>{bed.areaName} · {SUN_OPTIONS.find((option) => option.value === bed.sun)?.label}</span>
                <strong>{bed.name}</strong>
                <small>
                  {bed.planningMode === "square-feet"
                    ? `${Math.round(bedUsedSquareFeet(bed.id, data.plantings))} of ${bedSquareFeet(bed)} sq ft used`
                    : `${Math.round(bedUsedRowFeet(bed.id, data.plantings))} of ${bed.rowFeetCapacity} row-ft used`}{" "}
                  · {bedCapacityLabel(bed)} · {plantings.length} plantings
                </small>
                {history.length ? <p className="muted">Rotation history: {history.join(", ")}</p> : null}
              </div>
              <div className="item-actions">
                <Button type="button" variant="secondary" onClick={() => edit(bed.id)}>Edit</Button>
                <Button type="button" variant="ghost" onClick={() => deleteBed(bed.id)} aria-label={`Delete ${bed.name}`}><Trash2 size={18} /></Button>
              </div>
            </article>
          );
        })}
        {data.beds.length === 0 ? <div className="empty-state"><h2>No beds yet</h2><p>Add one bed to start assigning plantings.</p></div> : null}
      </section>
    </div>
  );
}
