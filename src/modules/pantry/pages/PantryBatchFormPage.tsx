import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { CATEGORY_OPTIONS, METHOD_OPTIONS, SOURCE_OPTIONS, UNIT_OPTIONS } from "../constants";
import { addMonths, today } from "../pantryUtils";
import type { PantryCategory, PantryMethod, PantrySourceType, PantryUnit } from "../types";
import { usePantry } from "../usePantry";

function defaultUnit(category: PantryCategory): PantryUnit {
  if (category === "freezer") return "pounds";
  if (category === "bulk-meat") return "pounds";
  if (category === "dry-bulk") return "buckets";
  if (category === "root-cellar") return "bins";
  return "quarts";
}

export function PantryBatchFormPage() {
  const { batchId } = useParams();
  const [searchParams] = useSearchParams();
  const { data, addProduct, addBatch, updateBatch, addLocation } = usePantry();
  const navigate = useNavigate();
  const existingBatch = data.batches.find((batch) => batch.id === batchId);
  const existingProduct = data.products.find((product) => product.id === existingBatch?.productId);
  const queryProductId = searchParams.get("productId");
  const queryProductName = searchParams.get("name") || "";
  const queryQuantity = Number(searchParams.get("quantity") || 0);
  const queryUnit = searchParams.get("unit") as PantryUnit | null;
  const queryMethod = searchParams.get("method") as PantryMethod | null;
  const isEditing = Boolean(batchId);

  const initial = useMemo(() => {
    const category = existingProduct?.category || "jars-canned";
    const dateAdded = existingBatch?.dateAdded || today();
    return {
      productId: existingBatch?.productId || (queryProductId && data.products.some((product) => product.id === queryProductId) ? queryProductId : data.products[0]?.id) || "new",
      newProductName: queryProductName,
      newProductCategory: category as PantryCategory,
      batchCode: existingBatch?.batchCode || "",
      quantity: existingBatch?.quantity || queryQuantity || 1,
      unit: existingBatch?.unit || queryUnit || defaultUnit(category as PantryCategory),
      dateAdded,
      locationId: existingBatch?.locationId || data.locations[0]?.id || "",
      sourceType: existingBatch?.sourceType || ((searchParams.get("sourceType") as PantrySourceType) || "manual"),
      sourceId: existingBatch?.sourceId || searchParams.get("sourceId") || "",
      method: existingBatch?.method || queryMethod || "water-bath",
      eatByDate: existingBatch?.eatByDate || addMonths(dateAdded, existingProduct?.defaultRotationMonths || 18),
      nextCheckDate: existingBatch?.nextCheckDate || "",
      lastCheckedDate: existingBatch?.lastCheckedDate || "",
      container: existingBatch?.container || "",
      packaging: existingBatch?.packaging || "",
      notes: existingBatch?.notes || searchParams.get("notes") || "",
    };
  }, [data.locations, data.products, existingBatch, existingProduct, queryMethod, queryProductName, queryQuantity, queryUnit, searchParams]);

  const [productId, setProductId] = useState(initial.productId);
  const [newProductName, setNewProductName] = useState(initial.newProductName);
  const [newProductCategory, setNewProductCategory] = useState<PantryCategory>(initial.newProductCategory);
  const [batchCode, setBatchCode] = useState(initial.batchCode);
  const [quantity, setQuantity] = useState(initial.quantity);
  const [unit, setUnit] = useState<PantryUnit>(initial.unit as PantryUnit);
  const [dateAdded, setDateAdded] = useState(initial.dateAdded);
  const [locationId, setLocationId] = useState(initial.locationId);
  const [customLocation, setCustomLocation] = useState("");
  const [sourceType, setSourceType] = useState<PantrySourceType>(initial.sourceType as PantrySourceType);
  const [sourceId, setSourceId] = useState(initial.sourceId);
  const [method, setMethod] = useState<PantryMethod>(initial.method as PantryMethod);
  const [eatByDate, setEatByDate] = useState(initial.eatByDate);
  const [nextCheckDate, setNextCheckDate] = useState(initial.nextCheckDate);
  const [lastCheckedDate, setLastCheckedDate] = useState(initial.lastCheckedDate);
  const [container, setContainer] = useState(initial.container);
  const [packaging, setPackaging] = useState(initial.packaging);
  const [notes, setNotes] = useState(initial.notes);

  if (isEditing && !existingBatch) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Pantry" title="Batch not found" />
        <Link className="button button-secondary" to="/pantry/products">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>
    );
  }

  const handleDateAdded = (nextDate: string) => {
    setDateAdded(nextDate);
    if (!existingBatch) {
      const product = data.products.find((entry) => entry.id === productId);
      setEatByDate(addMonths(nextDate, product?.defaultRotationMonths || CATEGORY_OPTIONS.find((entry) => entry.value === newProductCategory)?.rotationMonths || 12));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    let finalProductId = productId;
    if (productId === "new") {
      const product = addProduct({
        name: newProductName.trim(),
        category: newProductCategory,
        defaultRotationMonths: CATEGORY_OPTIONS.find((entry) => entry.value === newProductCategory)?.rotationMonths || 12,
        lowStockThreshold: 2,
        notes: "",
      });
      finalProductId = product.id;
    }
    let finalLocationId = locationId;
    if (locationId === "new") {
      finalLocationId = addLocation(customLocation.trim() || "Custom location").id;
    }

    const input = {
      productId: finalProductId,
      batchCode: batchCode.trim(),
      quantity: Math.max(0, quantity),
      unit,
      originalQuantity: existingBatch?.originalQuantity || Math.max(0, quantity),
      dateAdded,
      datePreserved: method === "pressure" || method === "water-bath" ? dateAdded : undefined,
      dateFrozen: method === "frozen" ? dateAdded : undefined,
      datePacked: method !== "pressure" && method !== "water-bath" && method !== "frozen" ? dateAdded : undefined,
      locationId: finalLocationId,
      sourceType,
      sourceId: sourceId.trim() || undefined,
      method,
      eatByDate,
      nextCheckDate,
      lastCheckedDate,
      container,
      packaging,
      notes,
      photoPlaceholder: "",
    };

    const saved = existingBatch ? (updateBatch(existingBatch.id, input), existingBatch) : addBatch(input);
    navigate(`/pantry/products/${finalProductId}${saved.id ? "" : ""}`);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Pantry" title={existingBatch ? "Edit batch" : "Add pantry batch"}>
        <p>Batches carry dates, location, source, method, and the quantity Rootcellar deducts from.</p>
      </PageHeader>

      <form className="form-panel" onSubmit={handleSubmit}>
        <label>
          Product
          <select value={productId} onChange={(event) => setProductId(event.target.value)} disabled={Boolean(existingBatch)}>
            {data.products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
            <option value="new">New product</option>
          </select>
        </label>
        {productId === "new" ? (
          <div className="form-grid">
            <label>
              New product name
              <input value={newProductName} onChange={(event) => setNewProductName(event.target.value)} required />
            </label>
            <label>
              Category
              <select value={newProductCategory} onChange={(event) => setNewProductCategory(event.target.value as PantryCategory)}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        <div className="form-grid">
          <label>
            Quantity
            <input type="number" min="0" step="0.1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required />
          </label>
          <label>
            Unit
            <select value={unit} onChange={(event) => setUnit(event.target.value as PantryUnit)}>
              {UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label>
            Location
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
              {data.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
              <option value="new">Other/custom</option>
            </select>
          </label>
          {locationId === "new" ? (
            <label>
              Custom location
              <input value={customLocation} onChange={(event) => setCustomLocation(event.target.value)} />
            </label>
          ) : null}
        </div>

        <details className="more-details">
          <summary>More details (batch code, method, dates, source, notes)</summary>
          <div className="form-grid">
            <label>
              Batch code
              <input value={batchCode} onChange={(event) => setBatchCode(event.target.value)} placeholder="2026-salsa-01" />
            </label>
            <label>
              Method / storage
              <select value={method} onChange={(event) => setMethod(event.target.value as PantryMethod)}>
                {METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date added / preserved
              <input type="date" value={dateAdded} onChange={(event) => handleDateAdded(event.target.value)} required />
            </label>
            <label>
              Eat by / use by
              <input type="date" value={eatByDate} onChange={(event) => setEatByDate(event.target.value)} />
            </label>
            {locationId !== "new" ? (
              <label>
                Container / bin
                <input value={container} onChange={(event) => setContainer(event.target.value)} placeholder="Shelf 2, blue tote, #4 bucket" />
              </label>
            ) : null}
            <label>
              Source
              <select value={sourceType} onChange={(event) => setSourceType(event.target.value as PantrySourceType)}>
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Source id placeholder
              <input value={sourceId} onChange={(event) => setSourceId(event.target.value)} />
            </label>
            <label>
              Packaging
              <input value={packaging} onChange={(event) => setPackaging(event.target.value)} placeholder="Vacuum bags, mylar, cartons..." />
            </label>
            <label>
              Next seal / condition check
              <input type="date" value={nextCheckDate} onChange={(event) => setNextCheckDate(event.target.value)} />
            </label>
            <label>
              Last checked
              <input type="date" value={lastCheckedDate} onChange={(event) => setLastCheckedDate(event.target.value)} />
            </label>
          </div>
          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} />
          </label>
        </details>

        <div className="button-row">
          <Link className="button button-secondary" to={existingBatch ? `/pantry/products/${existingBatch.productId}` : "/pantry"}>
            <ArrowLeft size={18} />
            Back
          </Link>
          <Button type="submit">
            <Save size={18} />
            Save batch
          </Button>
        </div>
      </form>
    </div>
  );
}
