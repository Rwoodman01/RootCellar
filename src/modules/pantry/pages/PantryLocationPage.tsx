import { MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../../../shared/components/PageHeader";
import { unitLabel } from "../constants";
import { formatQuantity } from "../pantryUtils";
import { usePantry } from "../usePantry";

export function PantryLocationPage() {
  const { locationId } = useParams();
  const { data } = usePantry();
  const locations = locationId ? data.locations.filter((location) => location.id === locationId) : data.locations;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Pantry" title={locationId ? locations[0]?.name || "Location" : "Locations"}>
        <p>Named locations are flat for V1, with parent fields in the data model for later nesting.</p>
      </PageHeader>

      <section className="pantry-grid">
        {locations.map((location) => {
          const batches = data.batches.filter((batch) => batch.locationId === location.id && batch.quantity > 0);
          return (
            <article className="pantry-panel" key={location.id}>
              <div className="section-heading">
                <p className="eyebrow">
                  <MapPin size={14} /> {batches.length} batches
                </p>
                <h2>{location.name}</h2>
              </div>
              <div className="compact-list">
                {batches.length ? (
                  batches.map((batch) => {
                    const product = data.products.find((entry) => entry.id === batch.productId);
                    return (
                      <Link to={`/pantry/products/${batch.productId}`} className="compact-row" key={batch.id}>
                        <strong>{product?.name || "Removed product"}</strong>
                        <span>
                          {formatQuantity(batch.quantity)} {unitLabel(batch.unit)}
                        </span>
                        <small>{batch.container || batch.batchCode || "No bin noted"}</small>
                      </Link>
                    );
                  })
                ) : (
                  <p className="muted">Nothing open here yet.</p>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
