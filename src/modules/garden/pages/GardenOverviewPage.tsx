import { CalendarDays, Plus, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { seedPacketWarning } from "../calculations";
import { useGarden } from "../useGarden";

export function GardenOverviewPage() {
  const { data } = useGarden();
  const activePlantings = data.plantings.filter((planting) => !planting.lastHarvestDate);
  const warnings = data.seedPackets
    .map((packet) => ({ packet, variety: data.varieties.find((variety) => variety.id === packet.varietyId) }))
    .map((entry) => ({ ...entry, warning: seedPacketWarning(entry.packet, entry.variety) }))
    .filter((entry) => entry.warning);
  const upcoming = activePlantings
    .flatMap((planting) => [
      { label: `${planting.crop} direct sow`, date: planting.directSownDate },
      { label: `${planting.crop} transplant`, date: planting.transplantedDate },
      { label: `${planting.crop} first harvest`, date: planting.firstHarvestDate },
    ])
    .filter((entry) => entry.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 5);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Garden"
        title="Plan the food, remember the growing"
        actions={
          <>
            <LinkButton to="/garden/targets">
              <Target size={18} />
              Plan from a food target
            </LinkButton>
            <LinkButton to="/garden/plantings/new" variant="secondary">
              <Plus size={18} />
              Add what I'm planting
            </LinkButton>
          </>
        }
      >
        <p>Rootcellar works backward from jars when that helps, and also records the beds, varieties, dates, and harvests you already know.</p>
      </PageHeader>

      <section className="summary-strip" aria-label="Garden summary">
        <Link to="/garden/beds" className="summary-main">
          <span>Beds</span>
          <strong>{data.beds.length}</strong>
        </Link>
        <Link to="/garden/plantings" className="summary-main">
          <span>Active plantings</span>
          <strong>{activePlantings.length}</strong>
        </Link>
        <Link to="/garden/harvests" className="summary-main">
          <span>Harvest logs</span>
          <strong>{data.harvests.length}</strong>
        </Link>
      </section>

      {data.beds.length === 0 && data.plantings.length === 0 ? (
        <EmptyState title="Start with a bed or a planting" action={<LinkButton to="/garden/beds">Add a bed</LinkButton>}>
          A bed can be precise or plain. Name it, give it rough row-feet, then attach the crops you are growing.
        </EmptyState>
      ) : (
        <section className="pantry-panel" aria-label="Upcoming garden dates">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Upcoming</p>
              <h2>Dates to notice</h2>
            </div>
            <CalendarDays size={18} />
          </div>
          <div className="compact-list">
            {upcoming.length ? (
              upcoming.map((entry) => (
                <div className="compact-row" key={`${entry.label}-${entry.date}`}>
                  <strong>{entry.label}</strong>
                  <span>{formatShortDate(entry.date)}</span>
                </div>
              ))
            ) : (
              <p className="muted">No dated plantings yet.</p>
            )}
            {warnings.length ? (
              <Link to="/garden/seeds" className="compact-row">
                <strong>Seed viability</strong>
                <span>{warnings.length} packet{warnings.length === 1 ? "" : "s"} worth a look</span>
              </Link>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
