import { FormEvent, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { productLabel, unitLabel } from "../../preservation/constants";
import { usePreservationPlans } from "../../preservation/usePreservationPlans";
import { planBackward } from "../calculations";
import type { GardenTargetSource, GardenTargetInput } from "../types";
import { useGarden } from "../useGarden";

export function PlanBackwardPage() {
  const { plans } = usePreservationPlans();
  const { data, addTarget, deleteTarget, createPlantingFromTarget, updateSettings } = useGarden();
  const preservationItems = plans.flatMap((plan) => plan.items.map((item) => ({ plan, item })));
  const [source, setSource] = useState<GardenTargetSource>("manual");
  const [sourceId, setSourceId] = useState("");
  const [cropProduct, setCropProduct] = useState("Tomato");
  const [targetUnits, setTargetUnits] = useState(40);
  const [targetUnitLabel, setTargetUnitLabel] = useState("quarts tomato sauce");
  const [poundsPerUnit, setPoundsPerUnit] = useState(3);
  const [lastFrostDate, setLastFrostDate] = useState(data.settings.lastFrostDate);
  const [firstFrostDate, setFirstFrostDate] = useState(data.settings.firstFrostDate);

  const result = useMemo(
    () => planBackward({ cropProduct, targetUnits, targetUnitLabel, poundsPerUnit, lastFrostDate, firstFrostDate, source, sourceId: sourceId || undefined }),
    [cropProduct, targetUnits, targetUnitLabel, poundsPerUnit, lastFrostDate, firstFrostDate, source, sourceId],
  );

  const selectPlannerItem = (id: string) => {
    setSourceId(id);
    const match = preservationItems.find((entry) => entry.item.id === id);
    if (!match) return;
    const label = productLabel(match.item.productType, match.item.customName);
    setSource("preservation-planner");
    setCropProduct(label.includes("tomato") || label.includes("Tomato") ? "Tomato" : label);
    setTargetUnits(match.item.targetQuantity);
    setTargetUnitLabel(unitLabel(match.item.unit));
    setPoundsPerUnit(match.item.unit === "quart-jars" ? 3 : match.item.unit === "pint-jars" ? 1.5 : 1);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    updateSettings({ lastFrostDate, firstFrostDate });
    addTarget(result);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Plan backward" title="Jars to pounds to plants to row-feet">
        <p>Use rough defaults in year one. The structure is ready for household history to override these assumptions later.</p>
      </PageHeader>
      <div className="split-layout">
        <form className="form-panel" onSubmit={submit}>
          <div className="form-grid">
            <label>Entry path<select value={source} onChange={(event) => setSource(event.target.value as GardenTargetSource)}><option value="manual">Manual food target</option><option value="preservation-planner">From Preservation</option></select></label>
            {source === "preservation-planner" ? <label>Preservation item<select value={sourceId} onChange={(event) => selectPlannerItem(event.target.value)}><option value="">Choose item</option>{preservationItems.map(({ plan, item }) => <option key={item.id} value={item.id}>{plan.title}: {productLabel(item.productType, item.customName)}</option>)}</select></label> : null}
            <label>Crop/product<input value={cropProduct} onChange={(event) => setCropProduct(event.target.value)} /></label>
            <label>Target amount<input type="number" min="0" value={targetUnits} onChange={(event) => setTargetUnits(Number(event.target.value))} /></label>
            <label>Target unit label<input value={targetUnitLabel} onChange={(event) => setTargetUnitLabel(event.target.value)} /></label>
            <label>Pounds per unit<input type="number" min="0" step="0.1" value={poundsPerUnit} onChange={(event) => setPoundsPerUnit(Number(event.target.value))} /></label>
            <label>Last frost<input type="date" value={lastFrostDate} onChange={(event) => setLastFrostDate(event.target.value)} /></label>
            <label>First frost<input type="date" value={firstFrostDate} onChange={(event) => setFirstFrostDate(event.target.value)} /></label>
          </div>
          <Button type="submit"><Save size={18} />Save garden target</Button>
        </form>
        <aside className="estimate-panel">
          <p className="eyebrow">Result</p>
          <h2>{result.cropProduct}</h2>
          <div className="estimate-pills">
            <span><strong>{result.estimatedPoundsNeeded}</strong> lb needed</span>
            <span><strong>{result.estimatedPlantsNeeded}</strong> plants</span>
            <span><strong>{result.estimatedRowFeetNeeded}</strong> row-ft</span>
          </div>
          <ul>
            {Object.entries(result.suggestedDates).filter(([, value]) => value).map(([key, value]) => <li key={key}>{key}: {value}</li>)}
          </ul>
          <details open><summary>Assumptions</summary><ul>{result.assumptionsUsed.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></details>
        </aside>
      </div>
      <section className="plan-list">
        {data.targets.map((target) => (
          <article className="garden-record-row" key={target.id}>
            <div><span>{target.source} · {target.targetUnits} {target.targetUnitLabel}</span><strong>{target.cropProduct}</strong><small>{target.estimatedPoundsNeeded} lb · {target.estimatedPlantsNeeded} plants · {target.estimatedRowFeetNeeded} row-ft</small></div>
            <div className="item-actions"><Button type="button" variant="secondary" onClick={() => createPlantingFromTarget(target.id)}><Plus size={18} />Planting</Button><Button type="button" variant="ghost" onClick={() => deleteTarget(target.id)} aria-label="Delete target"><Trash2 size={18} /></Button></div>
          </article>
        ))}
      </section>
    </div>
  );
}
