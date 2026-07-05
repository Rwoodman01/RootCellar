import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import {
  ESTIMATE_DISCLAIMER,
  METHOD_OPTIONS,
  PRODUCT_OPTIONS,
  UNIT_OPTIONS,
  methodLabel,
  productLabel,
} from "../constants";
import { EstimatePills } from "../components/EstimatePills";
import { PlanNotFound } from "../components/PlanNotFound";
import { estimateItem } from "../estimates";
import type { PreservationItem, PreservationMethod, PreservationUnit, ProductType } from "../types";
import { usePreservationPlan, usePreservationPlans } from "../usePreservationPlans";

function defaultMethodForProduct(productType: ProductType): PreservationMethod {
  if (productType === "green-beans" || productType === "broth-stock") return "pressure-canning";
  if (productType === "freezer-vegetables" || productType === "freezer-meat") return "freezing";
  return "water-bath-canning";
}

function defaultUnitForProduct(productType: ProductType): PreservationUnit {
  if (productType === "jam") return "half-pint-jars";
  if (productType === "freezer-vegetables" || productType === "freezer-meat") return "freezer-bags";
  return "quart-jars";
}

export function PreservationItemFormPage() {
  const { planId, itemId } = useParams();
  const plan = usePreservationPlan(planId);
  const { addItem, updateItem } = usePreservationPlans();
  const navigate = useNavigate();
  const existingItem = plan?.items.find((item) => item.id === itemId);
  const isEditing = Boolean(itemId);

  const initial = useMemo(
    () => ({
      productType: existingItem?.productType || "crushed-tomatoes",
      customName: existingItem?.customName || "",
      method: existingItem?.method || "water-bath-canning",
      targetQuantity: existingItem?.targetQuantity || 12,
      unit: existingItem?.unit || "quart-jars",
      notes: existingItem?.notes || "",
    }),
    [existingItem],
  );

  const [productType, setProductType] = useState<ProductType>(initial.productType as ProductType);
  const [customName, setCustomName] = useState(initial.customName);
  const [method, setMethod] = useState<PreservationMethod>(initial.method as PreservationMethod);
  const [targetQuantity, setTargetQuantity] = useState(initial.targetQuantity);
  const [unit, setUnit] = useState<PreservationUnit>(initial.unit as PreservationUnit);
  const [notes, setNotes] = useState(initial.notes);

  if (!plan || (isEditing && !existingItem)) {
    return <PlanNotFound />;
  }

  const previewItem: PreservationItem = {
    id: existingItem?.id || "preview",
    productType,
    customName,
    method,
    targetQuantity,
    unit,
    notes,
    createdAt: existingItem?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const estimate = estimateItem(previewItem);
  const heading = existingItem ? `Edit ${productLabel(existingItem.productType, existingItem.customName)}` : "Add preservation item";

  const handleProductChange = (nextProduct: ProductType) => {
    setProductType(nextProduct);
    if (!existingItem) {
      setMethod(defaultMethodForProduct(nextProduct));
      setUnit(defaultUnitForProduct(nextProduct));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      productType,
      customName: customName.trim(),
      method,
      targetQuantity: Math.max(0, targetQuantity),
      unit,
      notes,
    };

    if (existingItem) {
      updateItem(plan.id, existingItem.id, input);
    } else {
      addItem(plan.id, input);
    }

    navigate(`/preservation/${plan.id}`);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow={plan.title} title={heading}>
        <p>Use conservative planning numbers. Recipe choice and food safety stay with tested sources.</p>
      </PageHeader>

      <div className="split-layout">
        <form className="form-panel" onSubmit={handleSubmit}>
          <label>
            Product type
            <select value={productType} onChange={(event) => handleProductChange(event.target.value as ProductType)}>
              {PRODUCT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {productType === "custom" ? (
            <label>
              Custom item name
              <input value={customName} onChange={(event) => setCustomName(event.target.value)} required />
            </label>
          ) : null}

          <label>
            Preservation method
            <select value={method} onChange={(event) => setMethod(event.target.value as PreservationMethod)}>
              {METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="form-grid">
            <label>
              Target quantity
              <input
                type="number"
                min="0"
                step="1"
                value={targetQuantity}
                onChange={(event) => setTargetQuantity(Number(event.target.value))}
                required
              />
            </label>
            <label>
              Unit
              <select value={unit} onChange={(event) => setUnit(event.target.value as PreservationUnit)}>
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} />
          </label>

          <div className="button-row">
            <Link className="button button-secondary" to={`/preservation/${plan.id}`}>
              <ArrowLeft size={18} />
              Back
            </Link>
            <Button type="submit">
              <Save size={18} />
              Save item
            </Button>
          </div>
        </form>

        <aside className="estimate-panel">
          <p className="eyebrow">Live estimate</p>
          <h2>{productLabel(productType, customName)}</h2>
          <p>
            {targetQuantity || 0} {UNIT_OPTIONS.find((option) => option.value === unit)?.label.toLowerCase()} ·{" "}
            {methodLabel(method)}
          </p>
          <EstimatePills estimate={estimate} />
          <h3>Produce and prep assumptions</h3>
          <ul>
            {estimate.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
          <p className="disclaimer">{ESTIMATE_DISCLAIMER}</p>
        </aside>
      </div>
    </div>
  );
}
