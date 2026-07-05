import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { bedCapacityLabel, bedSquareFeet, bedUsedRowFeet, bedUsedSquareFeet } from "../calculations";
import { plantingLabel, sortedPlantingsForBed } from "../gardenUtils";
import { useGarden } from "../useGarden";

export function BedPlannerPage() {
  const { data, movePlanting, updatePlanting } = useGarden();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const unassigned = sortedPlantingsForBed(undefined, data.plantings);

  const reorder = (plantingId: string, direction: -1 | 1) => {
    const planting = data.plantings.find((entry) => entry.id === plantingId);
    if (!planting) return;
    movePlanting(plantingId, planting.bedId, Math.max(0, planting.bedPosition + direction));
  };

  const renderPlanting = (plantingId: string) => {
    const planting = data.plantings.find((entry) => entry.id === plantingId);
    if (!planting) return null;
    return (
      <div className="crop-block" draggable onDragStart={() => setDraggedId(planting.id)} onDragEnd={() => setDraggedId(null)}>
        <GripVertical size={16} aria-hidden="true" />
        <div>
          <strong>{plantingLabel(planting, data.varieties)}</strong>
          <span>{planting.rowFeet} row-ft · {planting.squareFeet || planting.rowFeet} sq ft · {planting.quantity} {planting.quantityUnit}</span>
        </div>
        <div className="planner-controls">
          <Button type="button" variant="ghost" onClick={() => reorder(planting.id, -1)} aria-label="Move up"><ArrowUp size={16} /></Button>
          <Button type="button" variant="ghost" onClick={() => reorder(planting.id, 1)} aria-label="Move down"><ArrowDown size={16} /></Button>
        </div>
        <label className="planner-inline-field">Bed<select value={planting.bedId || ""} onChange={(event) => movePlanting(planting.id, event.target.value || undefined, planting.bedPosition)}><option value="">Unassigned</option>{data.beds.map((bed) => <option key={bed.id} value={bed.id}>{bed.name}</option>)}</select></label>
        <label className="planner-inline-field">Row-ft<input type="number" min="0" step="0.5" value={planting.rowFeet} onChange={(event) => updatePlanting(planting.id, { ...planting, rowFeet: Number(event.target.value) })} /></label>
        <label className="planner-inline-field">Sq ft<input type="number" min="0" step="0.5" value={planting.squareFeet || planting.rowFeet} onChange={(event) => updatePlanting(planting.id, { ...planting, squareFeet: Number(event.target.value) })} /></label>
      </div>
    );
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Simple bed planner" title="Move crop blocks into beds" actions={<><LinkButton to="/garden/beds">Manage beds</LinkButton><LinkButton to="/garden/plantings/new" variant="secondary">Add planting</LinkButton></>}>
        <p>Drag blocks where it feels natural. On mobile, use the bed dropdown, move buttons, and row-foot field.</p>
      </PageHeader>
      <section className="planner-board">
        {data.beds.map((bed) => {
          const used = bed.planningMode === "square-feet" ? bedUsedSquareFeet(bed.id, data.plantings) : bedUsedRowFeet(bed.id, data.plantings);
          const capacity = bed.planningMode === "square-feet" ? bedSquareFeet(bed) : bed.rowFeetCapacity;
          const unit = bed.planningMode === "square-feet" ? "sq ft" : "row-ft";
          const percent = capacity ? Math.min(100, (used / capacity) * 100) : 0;
          const plantings = sortedPlantingsForBed(bed.id, data.plantings);
          return (
            <article
              className="bed-lane"
              key={bed.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedId) movePlanting(draggedId, bed.id, plantings.length);
              }}
            >
              <div className="bed-lane-header">
                <div>
                  <span>{bed.areaName}</span>
                  <strong>{bed.name}</strong>
                </div>
                <small>{Math.round(used)} / {capacity} {unit}</small>
              </div>
              <p className="muted">{bedCapacityLabel(bed)}</p>
              <div className="capacity-bar" aria-label={`${Math.round(percent)} percent used`}><span style={{ width: `${percent}%` }} /></div>
              <div className="crop-block-list">{plantings.map((planting) => <div key={planting.id}>{renderPlanting(planting.id)}</div>)}</div>
            </article>
          );
        })}
        <article className="bed-lane" onDragOver={(event) => event.preventDefault()} onDrop={() => draggedId && movePlanting(draggedId, undefined, unassigned.length)}>
          <div className="bed-lane-header"><div><span>No bed</span><strong>Unassigned</strong></div><small>{unassigned.length} blocks</small></div>
          <div className="crop-block-list">{unassigned.map((planting) => <div key={planting.id}>{renderPlanting(planting.id)}</div>)}</div>
        </article>
      </section>
    </div>
  );
}
