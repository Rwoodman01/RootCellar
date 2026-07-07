import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { cropDefaultsFor } from "../constants";
import type { PlantingInput } from "../types";
import { useGarden, usePlanting } from "../useGarden";

export function PlantingFormPage() {
  const { plantingId } = useParams();
  const planting = usePlanting(plantingId);
  const { data, addPlanting, updatePlanting } = useGarden();
  const navigate = useNavigate();
  const initial = useMemo<PlantingInput>(
    () => ({
      crop: planting?.crop || "Tomato",
      varietyId: planting?.varietyId,
      bedId: planting?.bedId,
      quantity: planting?.quantity || 1,
      quantityUnit: planting?.quantityUnit || "plants",
      rowFeet: planting?.rowFeet || 3,
      squareFeet: planting?.squareFeet || planting?.rowFeet || 3,
      bedPosition: planting?.bedPosition || 0,
      seedPacketId: planting?.seedPacketId,
      startedIndoorsDate: planting?.startedIndoorsDate,
      transplantedDate: planting?.transplantedDate,
      directSownDate: planting?.directSownDate,
      firstHarvestDate: planting?.firstHarvestDate,
      lastHarvestDate: planting?.lastHarvestDate,
      outcomeRating: planting?.outcomeRating || 0,
      successionOf: planting?.successionOf,
      notes: planting?.notes || "",
      photoPlaceholder: planting?.photoPlaceholder || "",
    }),
    [planting],
  );
  const [form, setForm] = useState<PlantingInput>(initial);

  if (plantingId && !planting) {
    return <div className="page-stack"><PageHeader eyebrow="Garden" title="Planting not found" /><Link className="button button-secondary" to="/garden/plantings"><ArrowLeft size={18} />Back to plantings</Link></div>;
  }

  const applyCropDefaults = (crop: string) => {
    const defaults = cropDefaultsFor(crop);
    setForm((current) => {
      const estimatedRowFeet = current.quantityUnit === "plants" ? Math.ceil(current.quantity / defaults.plantsPerRowFoot) : current.rowFeet;
      return { ...current, crop, rowFeet: estimatedRowFeet, squareFeet: current.squareFeet || estimatedRowFeet };
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const saved = planting ? (updatePlanting(planting.id, form), planting) : addPlanting(form);
    navigate("/garden/plantings", { replace: true });
    return saved;
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Planting" title={planting ? `Edit ${planting.crop}` : "Add what I'm planting"}>
        <p>Use this path when you already know what is going into the ground.</p>
      </PageHeader>
      <form className="form-panel" onSubmit={submit}>
        <div className="form-grid">
          <label>Crop<input list="garden-crops" value={form.crop} onChange={(event) => applyCropDefaults(event.target.value)} required /></label>
          <datalist id="garden-crops">{["Tomato", "Pepper", "Green bean", "Cucumber", "Carrot", "Beet", "Potato", "Lettuce", "Cabbage", "Kale"].map((crop) => <option key={crop} value={crop} />)}</datalist>
          <label>Bed<select value={form.bedId || ""} onChange={(event) => setForm({ ...form, bedId: event.target.value || undefined })}><option value="">Unassigned</option>{data.beds.map((bed) => <option key={bed.id} value={bed.id}>{bed.name}</option>)}</select></label>
          <label>Quantity<input type="number" min="0" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} /></label>
          <label>Quantity unit<select value={form.quantityUnit} onChange={(event) => setForm({ ...form, quantityUnit: event.target.value as PlantingInput["quantityUnit"] })}><option value="plants">Plants</option><option value="row-feet">Row-feet</option></select></label>
        </div>

        <details className="more-details">
          <summary>More details (variety, dates, bed math, notes)</summary>
          <div className="form-grid">
            <label>Variety<select value={form.varietyId || ""} onChange={(event) => setForm({ ...form, varietyId: event.target.value || undefined })}><option value="">No variety linked</option>{data.varieties.map((variety) => <option key={variety.id} value={variety.id}>{variety.name} ({variety.crop})</option>)}</select></label>
            <label>Seed packet<select value={form.seedPacketId || ""} onChange={(event) => setForm({ ...form, seedPacketId: event.target.value || undefined })}><option value="">No seed packet</option>{data.seedPackets.map((packet) => {
              const variety = data.varieties.find((entry) => entry.id === packet.varietyId);
              return <option key={packet.id} value={packet.id}>{variety?.name || "Packet"} · {packet.yearPacked}</option>;
            })}</select></label>
            <label>Row-feet<input type="number" min="0" step="0.5" value={form.rowFeet} onChange={(event) => setForm({ ...form, rowFeet: Number(event.target.value) })} /></label>
            <label>Square feet used<input type="number" min="0" step="0.5" value={form.squareFeet} onChange={(event) => setForm({ ...form, squareFeet: Number(event.target.value) })} /></label>
            <label>Outcome rating<input type="number" min="0" max="5" step="1" value={form.outcomeRating} onChange={(event) => setForm({ ...form, outcomeRating: Number(event.target.value) })} /></label>
            <label>Started indoors<input type="date" value={form.startedIndoorsDate || ""} onChange={(event) => setForm({ ...form, startedIndoorsDate: event.target.value || undefined })} /></label>
            <label>Direct sown<input type="date" value={form.directSownDate || ""} onChange={(event) => setForm({ ...form, directSownDate: event.target.value || undefined })} /></label>
            <label>Transplanted<input type="date" value={form.transplantedDate || ""} onChange={(event) => setForm({ ...form, transplantedDate: event.target.value || undefined })} /></label>
            <label>First harvest<input type="date" value={form.firstHarvestDate || ""} onChange={(event) => setForm({ ...form, firstHarvestDate: event.target.value || undefined })} /></label>
            <label>Last harvest<input type="date" value={form.lastHarvestDate || ""} onChange={(event) => setForm({ ...form, lastHarvestDate: event.target.value || undefined })} /></label>
            <label>Succession of<select value={form.successionOf || ""} onChange={(event) => setForm({ ...form, successionOf: event.target.value || undefined })}><option value="">Not a succession</option>{data.plantings.filter((entry) => entry.id !== planting?.id).map((entry) => <option key={entry.id} value={entry.id}>{entry.crop}</option>)}</select></label>
          </div>
          <label>Notes/photos placeholder<textarea rows={5} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        </details>

        <div className="button-row">
          <Link className="button button-secondary" to="/garden/plantings"><ArrowLeft size={18} />Back</Link>
          <Button type="submit"><Save size={18} />Save planting</Button>
        </div>
      </form>
    </div>
  );
}
