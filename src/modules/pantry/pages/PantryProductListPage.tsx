import { PackagePlus, Plus, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { categoryLabel, CATEGORY_OPTIONS, unitLabel } from "../constants";
import { batchSortDate, formatQuantity, getLowStockProducts, getOpenBatches, getProductTotal, getUseSoonBatches } from "../pantryUtils";
import type { PantryCategory } from "../types";
import { usePantry } from "../usePantry";

export function PantryProductListPage() {
  const { data, useOneFromProduct, undoTransaction } = usePantry();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PantryCategory | "all">("all");
  const [locationId, setLocationId] = useState("all");
  const [flag, setFlag] = useState<"all" | "low" | "soon">("all");
  const [undo, setUndo] = useState<{ id: string; label: string } | null>(null);
  const lowIds = useMemo(() => new Set(getLowStockProducts(data).map((product) => product.id)), [data]);
  const soonIds = useMemo(() => new Set(getUseSoonBatches(data).map((batch) => batch.productId)), [data]);

  const products = useMemo(() => {
    return data.products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || product.category === category;
      const matchesLocation = locationId === "all" || data.batches.some((batch) => batch.productId === product.id && batch.locationId === locationId && batch.quantity > 0);
      const matchesFlag = flag === "all" || (flag === "low" && lowIds.has(product.id)) || (flag === "soon" && soonIds.has(product.id));
      return matchesQuery && matchesCategory && matchesLocation && matchesFlag;
    });
  }, [category, data.batches, data.products, flag, locationId, lowIds, query, soonIds]);

  const handleUseOne = (productId: string) => {
    const result = useOneFromProduct(productId);
    if (!result) return;
    setUndo({ id: result.transaction.id, label: result.product.name });
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Pantry"
        title="Products"
        actions={
          <>
            <LinkButton to="/pantry/products/new">
              <Plus size={18} />
              Add product
            </LinkButton>
            <LinkButton to="/pantry/batches/new" variant="secondary">
              <PackagePlus size={18} />
              Add batch
            </LinkButton>
          </>
        }
      >
        <p>Search, filter, and deduct from the oldest open batch without opening a logging screen.</p>
      </PageHeader>

      <section className="filter-panel">
        <label>
          <span>
            <Search size={16} /> Search
          </span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tomato sauce, pork, flour..." />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as PantryCategory | "all")}>
            <option value="all">All categories</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location
          <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
            <option value="all">All locations</option>
            {data.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Signal
          <select value={flag} onChange={(event) => setFlag(event.target.value as "all" | "low" | "soon")}>
            <option value="all">All stock</option>
            <option value="low">Low stock</option>
            <option value="soon">Use soon</option>
          </select>
        </label>
      </section>

      {products.length === 0 ? (
        <EmptyState title="No products match" action={<LinkButton to="/pantry/products/new">Add product</LinkButton>}>
          Try a different filter or add the first pantry product.
        </EmptyState>
      ) : (
        <section className="plan-list" aria-label="Pantry products">
          {products.map((product) => {
            const open = getOpenBatches(product.id, data.batches);
            const oldest = open[0];
            return (
              <article className="plan-row pantry-product-row" key={product.id}>
                <Link to={`/pantry/products/${product.id}`}>
                  <span>{categoryLabel(product.category)}</span>
                  <strong>{product.name}</strong>
                  <small>
                    {formatQuantity(getProductTotal(product.id, data.batches))} total
                    {oldest ? ` · oldest ${formatQuantity(oldest.quantity)} ${unitLabel(oldest.unit)} from ${batchSortDate(oldest)}` : " · no open batch"}
                  </small>
                </Link>
                <Button type="button" variant="secondary" onClick={() => handleUseOne(product.id)} disabled={!oldest}>
                  <RotateCcw size={17} />
                  Use one
                </Button>
              </article>
            );
          })}
        </section>
      )}
      {undo ? (
        <div className="toast-banner" role="status">
          <span>Used 1 {undo.label}</span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              undoTransaction(undo.id);
              setUndo(null);
            }}
          >
            Undo
          </Button>
        </div>
      ) : null}
    </div>
  );
}
