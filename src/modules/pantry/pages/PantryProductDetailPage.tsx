import { ArrowLeft, Edit3, Minus, PackagePlus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { categoryLabel, methodLabel, sourceLabel, unitLabel } from "../constants";
import { batchSortDate, formatQuantity, getOpenBatches, getProductInsight, getProductTotal, getRunwayLine } from "../pantryUtils";
import { usePantry } from "../usePantry";

export function PantryProductDetailPage() {
  const { productId } = useParams();
  const { data, adjustBatch, deleteBatch, deleteProduct, markBatchUsedUp, undoTransaction, useOneFromProduct } = usePantry();
  const [undo, setUndo] = useState<{ id: string; label: string } | null>(null);
  const product = data.products.find((entry) => entry.id === productId);

  if (!product) {
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

  const batches = data.batches.filter((batch) => batch.productId === product.id).sort((a, b) => batchSortDate(a).localeCompare(batchSortDate(b)));
  const transactions = data.transactions.filter((transaction) => batches.some((batch) => batch.id === transaction.batchId));

  const handleUseOne = () => {
    const result = useOneFromProduct(product.id);
    if (!result) return;
    setUndo({ id: result.transaction.id, label: product.name });
  };

  const handleDeleteProduct = () => {
    if (!window.confirm(`Delete "${product.name}" and all of its batches?`)) return;
    deleteProduct(product.id);
  };

  const handleDeleteBatch = (batchId: string) => {
    if (!window.confirm("Delete this pantry batch?")) return;
    deleteBatch(batchId);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={categoryLabel(product.category)}
        title={product.name}
        actions={
          <>
            <LinkButton to={`/pantry/products/${product.id}/edit`} variant="secondary">
              <Edit3 size={18} />
              Edit
            </LinkButton>
            <LinkButton to={`/pantry/batches/new?productId=${product.id}`} variant="secondary">
              <PackagePlus size={18} />
              Add batch
            </LinkButton>
          </>
        }
      >
        <p>{product.notes || getProductInsight(product, data)}</p>
      </PageHeader>

      <section className="summary-strip" aria-label="Product summary">
        <div>
          <span>Total left</span>
          <strong>{formatQuantity(getProductTotal(product.id, data.batches))}</strong>
        </div>
        <div>
          <span>Open batches</span>
          <strong>{getOpenBatches(product.id, data.batches).length}</strong>
        </div>
        <div>
          <span>Low at</span>
          <strong>{product.lowStockThreshold}</strong>
        </div>
        <div>
          <span>Runway</span>
          <small>{getRunwayLine(product, data)}</small>
        </div>
      </section>

      <section className="toolbar-row">
        <Button type="button" onClick={handleUseOne} disabled={!getOpenBatches(product.id, data.batches).length}>
          <RotateCcw size={18} />
          Use one
        </Button>
        <Button type="button" variant="danger" onClick={handleDeleteProduct}>
          <Trash2 size={18} />
          Delete product
        </Button>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <p className="eyebrow">Batches</p>
          <h2>Oldest first</h2>
        </div>
        <div className="item-list">
          {batches.map((batch) => {
            const location = data.locations.find((entry) => entry.id === batch.locationId);
            return (
              <article className="item-card" key={batch.id}>
                <div className="item-card-top">
                  <div>
                    <span>{methodLabel(batch.method)}</span>
                    <h3>{batch.batchCode || formatShortDate(batchSortDate(batch))}</h3>
                    <p>
                      {formatQuantity(batch.quantity)} of {formatQuantity(batch.originalQuantity)} {unitLabel(batch.unit)} · {location?.name || "No location"}
                    </p>
                    <small>
                      Added {formatShortDate(batch.dateAdded)}
                      {batch.eatByDate ? ` · use by ${formatShortDate(batch.eatByDate)}` : ""} · {sourceLabel(batch.sourceType)}
                    </small>
                  </div>
                  <div className="item-actions">
                    <Link className="icon-button" to={`/pantry/batches/${batch.id}/edit`} aria-label="Edit batch">
                      <Edit3 size={17} />
                    </Link>
                    <Button type="button" variant="ghost" className="icon-button" onClick={() => handleDeleteBatch(batch.id)} aria-label="Delete batch">
                      <Trash2 size={17} />
                    </Button>
                  </div>
                </div>
                <div className="button-row">
                  <Button type="button" variant="secondary" onClick={() => adjustBatch(batch.id, -1, "Manual deduction")} disabled={batch.quantity <= 0}>
                    <Minus size={17} />
                    One less
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => adjustBatch(batch.id, 1, "Manual add")}>
                    <Plus size={17} />
                    One more
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => markBatchUsedUp(batch.id)} disabled={batch.quantity <= 0}>
                    Mark used up
                  </Button>
                </div>
                {batch.container || batch.packaging || batch.notes ? (
                  <p className="item-note">{[batch.container, batch.packaging, batch.notes].filter(Boolean).join(" · ")}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <p className="eyebrow">History</p>
          <h2>Transactions</h2>
        </div>
        <div className="compact-list">
          {transactions.length ? (
            transactions.map((transaction) => {
              const batch = data.batches.find((entry) => entry.id === transaction.batchId);
              return (
                <div className="compact-row" key={transaction.id}>
                  <strong>
                    {transaction.delta > 0 ? "+" : ""}
                    {formatQuantity(transaction.delta)} {batch ? unitLabel(batch.unit) : "units"}
                  </strong>
                  <span>{transaction.note || "Adjustment"}</span>
                  <small>{new Date(transaction.occurredAt).toLocaleString()}</small>
                </div>
              );
            })
          ) : (
            <p className="muted">No use history yet.</p>
          )}
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
    </div>
  );
}
