import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { bedName, harvestTotalForPlanting, plantingLabel } from "../gardenUtils";
import { useGarden } from "../useGarden";

export function PlantingsPage() {
  const { data, deletePlanting } = useGarden();
  const [query, setQuery] = useState("");
  const [bedId, setBedId] = useState("");
  const visible = useMemo(
    () => data.plantings.filter((planting) => (!query || planting.crop.toLowerCase().includes(query.toLowerCase()) || plantingLabel(planting, data.varieties).toLowerCase().includes(query.toLowerCase())) && (!bedId || planting.bedId === bedId)),
    [data.plantings, data.varieties, query, bedId],
  );

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Plantings" title="What is growing, where, and when" actions={<LinkButton to="/garden/plantings/new"><Plus size={18} />Add planting</LinkButton>}>
        <p>Record what you already planted or what you plan to plant, without forcing a food target first.</p>
      </PageHeader>
      <section className="filter-panel">
        <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tomato, kale, Amish Paste" /></label>
        <label>Bed<select value={bedId} onChange={(event) => setBedId(event.target.value)}><option value="">All beds</option>{data.beds.map((bed) => <option key={bed.id} value={bed.id}>{bed.name}</option>)}</select></label>
      </section>
      {data.plantings.length === 0 ? (
        <EmptyState title="No plantings yet" action={<LinkButton to="/garden/plantings/new"><Plus size={18} />Add what I'm planting</LinkButton>}>Start with crop, variety, bed, row-feet, dates, and notes.</EmptyState>
      ) : (
        <section className="plan-list">
          {visible.map((planting) => (
            <article className="plan-row" key={planting.id}>
              <Link to={`/garden/plantings/${planting.id}/edit`}>
                <span>{bedName(data.beds, planting.bedId)} · {planting.quantity} {planting.quantityUnit}</span>
                <strong>{plantingLabel(planting, data.varieties)}</strong>
                <small>{planting.rowFeet} row-ft · {planting.squareFeet || planting.rowFeet} sq ft · harvest {formatShortDate(planting.firstHarvestDate)} · logged {harvestTotalForPlanting(planting.id, data.harvests)} total units</small>
                <ArrowRight size={18} />
              </Link>
              <Button type="button" variant="ghost" onClick={() => deletePlanting(planting.id)} aria-label={`Delete ${planting.crop}`}><Trash2 size={18} /></Button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
