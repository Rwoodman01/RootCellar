import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { methodLabel, unitLabel } from "../constants";
import { batchSortDate, daysUntil, formatQuantity, getEatFirstBatches } from "../pantryUtils";
import { usePantry } from "../usePantry";

export function PantryEatFirstPage() {
  const { data } = usePantry();
  const batches = getEatFirstBatches(data);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Pantry" title="Eat first / use soon">
        <p>Calm rotation signals from dates and quantities already in the pantry.</p>
      </PageHeader>
      <Link className="button button-secondary" to="/pantry">
        <ArrowLeft size={18} />
        Pantry overview
      </Link>
      <section className="item-list">
        {batches.map((batch) => {
          const product = data.products.find((entry) => entry.id === batch.productId);
          const location = data.locations.find((entry) => entry.id === batch.locationId);
          const remainingDays = daysUntil(batch.eatByDate);
          return (
            <Link to={`/pantry/products/${batch.productId}`} className="item-card pantry-link-card" key={batch.id}>
              <div className="item-card-top">
                <div>
                  <span>{methodLabel(batch.method)}</span>
                  <h3>{product?.name || "Removed product"}</h3>
                  <p>
                    {formatQuantity(batch.quantity)} {unitLabel(batch.unit)} · {location?.name || "No location"}
                  </p>
                  <small>
                    {batch.eatByDate ? `Use by ${formatShortDate(batch.eatByDate)}` : `Stored ${formatShortDate(batchSortDate(batch))}`}
                    {remainingDays !== null ? ` · ${remainingDays < 0 ? `${Math.abs(remainingDays)} days past` : `${remainingDays} days left`}` : ""}
                  </small>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
