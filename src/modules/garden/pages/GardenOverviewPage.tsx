import { CalendarDays, LayoutGrid, Plus, Sprout, Target, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { seedPacketWarning, rotationWhispers } from "../calculations";
import { bedSquareFeet, bedUsedRowFeet, bedUsedSquareFeet } from "../calculations";
import { useGarden } from "../useGarden";

export function GardenOverviewPage() {
  const { data } = useGarden();
  const activePlantings = data.plantings.filter((planting) => !planting.lastHarvestDate);
  const warnings = data.seedPackets
    .map((packet) => ({ packet, variety: data.varieties.find((variety) => variety.id === packet.varietyId) }))
    .map((entry) => ({ ...entry, warning: seedPacketWarning(entry.packet, entry.variety) }))
    .filter((entry) => entry.warning);
  const whispers = rotationWhispers(data.beds, data.plantings).slice(0, 3);
  const upcoming = activePlantings
    .flatMap((planting) => [
      { label: `${planting.crop} direct sow`, date: planting.directSownDate },
      { label: `${planting.crop} transplant`, date: planting.transplantedDate },
      { label: `${planting.crop} first harvest`, date: planting.firstHarvestDate },
    ])
    .filter((entry) => entry.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 4);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Garden"
        title="Plan the food, remember the growing"
        actions={
          <>
            <LinkButton to="/garden/plan">
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
          <small>
            {Math.round(data.beds.reduce((sum, bed) => sum + (bed.planningMode === "square-feet" ? bedSquareFeet(bed) : bed.rowFeetCapacity), 0))}{" "}
            mixed ft capacity
          </small>
        </Link>
        <Link to="/garden/plantings" className="summary-main">
          <span>Active plantings</span>
          <strong>{activePlantings.length}</strong>
          <small>{Math.round(activePlantings.reduce((sum, planting) => sum + planting.rowFeet, 0))} row-ft in use</small>
        </Link>
        <Link to="/garden/harvests" className="summary-main">
          <span>Harvest logs</span>
          <strong>{data.harvests.length}</strong>
          <small>Fresh, pantry, preserved, and more</small>
        </Link>
        <Link to="/garden/targets" className="summary-main">
          <span>Food targets</span>
          <strong>{data.targets.length}</strong>
          <small>{data.targets.filter((target) => target.source === "preservation-planner").length} planner-linked</small>
        </Link>
      </section>

      {data.beds.length === 0 && data.plantings.length === 0 ? (
        <EmptyState
          title="Start with a bed or a planting"
          action={
            <LinkButton to="/garden/beds">
              <LayoutGrid size={18} />
              Add a bed
            </LinkButton>
          }
        >
          A bed can be precise or plain. Name it, give it rough row-feet, then attach the crops you are growing.
        </EmptyState>
      ) : null}

      <section className="garden-dashboard-grid">
        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Upcoming</p>
              <h2>Dates to notice</h2>
            </div>
            <CalendarDays size={18} />
          </div>
          <div className="compact-list">
            {upcoming.length ? upcoming.map((entry) => <div className="compact-row" key={`${entry.label}-${entry.date}`}><strong>{entry.label}</strong><span>{formatShortDate(entry.date)}</span></div>) : <p className="muted">No dated plantings yet.</p>}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Seed warnings</p>
              <h2>Viability edges</h2>
            </div>
            <Wheat size={18} />
          </div>
          <div className="compact-list">
            {warnings.length ? warnings.slice(0, 4).map((entry) => <Link to="/garden/seeds" className="compact-row" key={entry.packet.id}><strong>{entry.variety?.name || "Seed packet"}</strong><span>{entry.warning}</span></Link>) : <p className="muted">No seed viability warnings.</p>}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Rotation whispers</p>
              <h2>Bed memory</h2>
            </div>
            <Sprout size={18} />
          </div>
          <div className="compact-list">
            {whispers.length ? whispers.map((whisper) => <div className="compact-row" key={whisper}><strong>{whisper}</strong><span>Use this when choosing next year's bed.</span></div>) : <p className="muted">Rotation notes appear after plantings have bed assignments.</p>}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Bed load</p>
              <h2>Space used</h2>
            </div>
            <Link to="/garden/planner">Planner</Link>
          </div>
          <div className="compact-list">
            {data.beds.slice(0, 4).map((bed) => {
              const used = bed.planningMode === "square-feet" ? bedUsedSquareFeet(bed.id, data.plantings) : bedUsedRowFeet(bed.id, data.plantings);
              const capacity = bed.planningMode === "square-feet" ? bedSquareFeet(bed) : bed.rowFeetCapacity;
              const unit = bed.planningMode === "square-feet" ? "sq ft" : "row-ft";
              return <Link to="/garden/planner" className="compact-row" key={bed.id}><strong>{bed.name}</strong><span>{Math.round(used)} of {capacity} {unit} used</span></Link>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
