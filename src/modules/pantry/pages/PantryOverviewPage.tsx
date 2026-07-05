import { ArrowRight, Clock, MapPin, PackagePlus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { categoryLabel, unitLabel } from "../constants";
import { formatQuantity, getEatFirstBatches, getLowStockProducts, getProductInsight, getProductTotal, getUseSoonBatches } from "../pantryUtils";
import { usePantry } from "../usePantry";

export function PantryOverviewPage() {
  const { data, useOneFromProduct, undoTransaction } = usePantry();
  const [undo, setUndo] = useState<{ id: string; label: string } | null>(null);
  const eatFirst = getEatFirstBatches(data).slice(0, 4);
  const useSoon = getUseSoonBatches(data).slice(0, 4);
  const lowStock = getLowStockProducts(data).slice(0, 4);
  const locationCounts = data.locations.map((location) => ({
    location,
    batches: data.batches.filter((batch) => batch.locationId === location.id && batch.quantity > 0),
  }));

  const handleUseOne = (productId: string) => {
    const result = useOneFromProduct(productId);
    if (!result) return;
    setUndo({ id: result.transaction.id, label: result.product.name });
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Pantry"
        title="What is put away, where it sits, and what to eat first"
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
        <p>Fast household inventory built around one-tap deduction from the oldest open batch.</p>
      </PageHeader>

      {data.products.length === 0 ? (
        <EmptyState
          title="Start with one thing on the shelf"
          action={
            <LinkButton to="/pantry/products/new">
              <Plus size={18} />
              Add pantry product
            </LinkButton>
          }
        >
          Add tomato sauce, freezer pork, flour buckets, potatoes, kraut, or any food your household stores.
        </EmptyState>
      ) : (
        <>
          <section className="summary-strip" aria-label="Pantry summary">
            <Link to="/pantry/products" className="summary-main">
              <span>Products</span>
              <strong>{data.products.length}</strong>
              <small>Search and deduct</small>
              <ArrowRight size={18} />
            </Link>
            <div>
              <span>Batches</span>
              <strong>{data.batches.length}</strong>
            </div>
            <div>
              <span>Low stock</span>
              <strong>{lowStock.length}</strong>
            </div>
            <div>
              <span>Use soon</span>
              <strong>{useSoon.length}</strong>
            </div>
          </section>

          <section className="pantry-grid">
            <div className="pantry-panel">
              <div className="section-heading section-heading-row">
                <div>
                  <p className="eyebrow">Eat first</p>
                  <h2>Oldest and closest dates</h2>
                </div>
                <Link to="/pantry/eat-first">View all</Link>
              </div>
              <div className="compact-list">
                {eatFirst.map((batch) => {
                  const product = data.products.find((entry) => entry.id === batch.productId);
                  const location = data.locations.find((entry) => entry.id === batch.locationId);
                  return (
                    <Link to={`/pantry/products/${batch.productId}`} className="compact-row" key={batch.id}>
                      <strong>{product?.name || "Removed product"}</strong>
                      <span>
                        {formatQuantity(batch.quantity)} {unitLabel(batch.unit)} · {location?.name || "No location"}
                      </span>
                      <small>{batch.eatByDate ? `Use by ${formatShortDate(batch.eatByDate)}` : `Stored ${formatShortDate(batch.dateAdded)}`}</small>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Low stock</p>
                <h2>Running low</h2>
              </div>
              <div className="compact-list">
                {lowStock.length ? (
                  lowStock.map((product) => (
                    <div className="compact-row compact-row-action" key={product.id}>
                      <Link to={`/pantry/products/${product.id}`}>
                        <strong>{product.name}</strong>
                        <span>
                          {formatQuantity(getProductTotal(product.id, data.batches))} left · threshold {product.lowStockThreshold}
                        </span>
                        <small>{categoryLabel(product.category)}</small>
                      </Link>
                      <Button type="button" variant="secondary" onClick={() => handleUseOne(product.id)} aria-label={`Use one ${product.name}`}>
                        <RotateCcw size={17} />
                        Use one
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="muted">No products are under their low-stock threshold.</p>
                )}
              </div>
            </div>
          </section>

          <section className="pantry-grid">
            <div className="pantry-panel">
              <div className="section-heading section-heading-row">
                <div>
                  <p className="eyebrow">Locations</p>
                  <h2>Where food sits</h2>
                </div>
                <Link to="/pantry/locations">Open</Link>
              </div>
              <div className="location-chip-grid">
                {locationCounts
                  .filter((entry) => entry.batches.length)
                  .slice(0, 8)
                  .map((entry) => (
                    <Link to={`/pantry/locations/${entry.location.id}`} className="location-chip" key={entry.location.id}>
                      <MapPin size={16} />
                      <span>{entry.location.name}</span>
                      <strong>{entry.batches.length}</strong>
                    </Link>
                  ))}
              </div>
            </div>

            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Runway</p>
                <h2>What usage says</h2>
              </div>
              <div className="compact-list">
                {data.products.slice(0, 4).map((product) => (
                  <Link to={`/pantry/products/${product.id}`} className="compact-row" key={product.id}>
                    <strong>{product.name}</strong>
                    <span>{getProductInsight(product, data)}</span>
                    <small>
                      <Clock size={14} /> {product.defaultRotationMonths} month rotation
                    </small>
                  </Link>
                ))}
              </div>
            </div>
          </section>
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
        </>
      )}
    </div>
  );
}
