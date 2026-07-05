import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { CATEGORY_OPTIONS, categoryLabel } from "../constants";
import type { PantryCategory } from "../types";
import { usePantry, usePantryProduct } from "../usePantry";

export function PantryProductFormPage() {
  const { productId } = useParams();
  const product = usePantryProduct(productId);
  const { addProduct, updateProduct } = usePantry();
  const navigate = useNavigate();
  const isEditing = Boolean(productId);

  const initial = useMemo(
    () => ({
      name: product?.name || "",
      category: product?.category || "jars-canned",
      defaultRotationMonths: product?.defaultRotationMonths || 18,
      lowStockThreshold: product?.lowStockThreshold || 2,
      notes: product?.notes || "",
    }),
    [product],
  );

  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState<PantryCategory>(initial.category as PantryCategory);
  const [defaultRotationMonths, setDefaultRotationMonths] = useState(initial.defaultRotationMonths);
  const [lowStockThreshold, setLowStockThreshold] = useState(initial.lowStockThreshold);
  const [notes, setNotes] = useState(initial.notes);

  if (isEditing && !product) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Pantry" title="Product not found" />
        <Link className="button button-secondary" to="/pantry/products">
          <ArrowLeft size={18} />
          Back to products
        </Link>
      </div>
    );
  }

  const handleCategoryChange = (nextCategory: PantryCategory) => {
    setCategory(nextCategory);
    if (!product) {
      const option = CATEGORY_OPTIONS.find((entry) => entry.value === nextCategory);
      setDefaultRotationMonths(option?.rotationMonths || 12);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      name: name.trim(),
      category,
      defaultRotationMonths,
      lowStockThreshold,
      notes,
    };
    const saved = product ? (updateProduct(product.id, input), product) : addProduct(input);
    navigate(`/pantry/products/${saved.id}`);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Pantry" title={product ? `Edit ${product.name}` : "Add pantry product"}>
        <p>A product is the master item. Batches hold the actual jars, pounds, bins, and dates.</p>
      </PageHeader>

      <form className="form-panel" onSubmit={handleSubmit}>
        <label>
          Product name
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Tomato sauce" />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => handleCategoryChange(event.target.value as PantryCategory)}>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Rotation window, months
            <input type="number" min="0" step="1" value={defaultRotationMonths} onChange={(event) => setDefaultRotationMonths(Number(event.target.value))} />
          </label>
          <label>
            Low stock threshold
            <input type="number" min="0" step="1" value={lowStockThreshold} onChange={(event) => setLowStockThreshold(Number(event.target.value))} />
          </label>
        </div>
        <label>
          Notes
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} />
        </label>
        <div className="button-row">
          <Link className="button button-secondary" to={product ? `/pantry/products/${product.id}` : "/pantry/products"}>
            <ArrowLeft size={18} />
            Back
          </Link>
          <Button type="submit">
            <Save size={18} />
            Save {categoryLabel(category)}
          </Button>
        </div>
      </form>
    </div>
  );
}
