import { PackagePlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { productLabel, unitLabel as preservationUnitLabel } from "../../preservation/constants";
import { usePreservationPlans } from "../../preservation/usePreservationPlans";
import { addMonths, today } from "../pantryUtils";
import type { PantryMethod, PantryUnit } from "../types";
import { usePantry } from "../usePantry";

function pantryUnitFromPreservation(unit: string): PantryUnit {
  if (unit === "half-pint-jars") return "half-pints";
  if (unit === "pint-jars") return "pints";
  if (unit === "quart-jars") return "quarts";
  if (unit === "pounds") return "pounds";
  if (unit === "gallons") return "gallons";
  if (unit === "freezer-bags") return "bags";
  return "jars";
}

function pantryMethodFromPreservation(method: string): PantryMethod {
  if (method === "pressure-canning") return "pressure";
  if (method === "water-bath-canning") return "water-bath";
  if (method === "freezing") return "frozen";
  if (method === "dehydrating") return "dehydrated";
  if (method === "fermenting") return "fermented";
  return "other";
}

export function PantryImportPage() {
  const { plans } = usePreservationPlans();
  const { data, addProduct, addBatch } = usePantry();
  const navigate = useNavigate();
  const entries = plans.flatMap((plan) => plan.items.map((item) => ({ plan, item })));
  const [selectedKey, setSelectedKey] = useState(entries[0] ? `${entries[0].plan.id}:${entries[0].item.id}` : "");
  const [locationId, setLocationId] = useState(data.locations[0]?.id || "");

  const selected = entries.find((entry) => `${entry.plan.id}:${entry.item.id}` === selectedKey);

  const handleImport = () => {
    if (!selected || !locationId) return;
    const name = productLabel(selected.item.productType, selected.item.customName);
    const existing = data.products.find((product) => product.name.toLowerCase() === name.toLowerCase());
    const product =
      existing ||
      addProduct({
        name,
        category: selected.item.method === "freezing" ? "freezer" : selected.item.method === "dehydrating" ? "dehydrated" : selected.item.method === "fermenting" ? "fermented" : "jars-canned",
        defaultRotationMonths: selected.item.method === "freezing" ? 9 : 18,
        lowStockThreshold: 2,
        notes: `Created from ${selected.plan.title}.`,
      });
    const added = today();
    addBatch({
      productId: product.id,
      batchCode: `${selected.plan.seasonYear}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      quantity: selected.item.targetQuantity,
      unit: pantryUnitFromPreservation(selected.item.unit),
      originalQuantity: selected.item.targetQuantity,
      dateAdded: added,
      datePreserved: selected.item.method.includes("canning") ? added : undefined,
      dateFrozen: selected.item.method === "freezing" ? added : undefined,
      datePacked: selected.item.method !== "freezing" && !selected.item.method.includes("canning") ? added : undefined,
      locationId,
      sourceType: "preservation-plan",
      sourceId: `${selected.plan.id}:${selected.item.id}`,
      method: pantryMethodFromPreservation(selected.item.method),
      eatByDate: addMonths(added, selected.item.method === "freezing" ? 9 : 18),
      notes: selected.item.notes,
    });
    navigate(`/pantry/products/${product.id}`);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Pantry" title="Create a batch from Preservation">
        <p>Bring over product, target count, method, and notes. Choose where the finished food sits, then confirm.</p>
      </PageHeader>

      {entries.length === 0 ? (
        <EmptyState title="No preservation items yet">Add a preservation plan item first, then return here to create a pantry batch draft.</EmptyState>
      ) : (
        <section className="form-panel">
          <label>
            Preservation item
            <select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
              {entries.map(({ plan, item }) => (
                <option key={`${plan.id}:${item.id}`} value={`${plan.id}:${item.id}`}>
                  {plan.title} · {productLabel(item.productType, item.customName)} · {item.targetQuantity} {preservationUnitLabel(item.unit)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Pantry location
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
              {data.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          {selected ? (
            <p className="item-note">
              Draft batch: {productLabel(selected.item.productType, selected.item.customName)} · {selected.item.targetQuantity}{" "}
              {preservationUnitLabel(selected.item.unit)} · source saved back to the preservation item.
            </p>
          ) : null}
          <Button type="button" onClick={handleImport} disabled={!selected || !locationId}>
            <PackagePlus size={18} />
            Create pantry batch
          </Button>
        </section>
      )}
    </div>
  );
}
