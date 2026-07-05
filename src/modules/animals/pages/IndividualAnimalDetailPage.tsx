import { ArrowLeft, ClipboardList, Edit3, PackagePlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { eventTypeLabel, purposeLabel, statusLabel } from "../constants";
import {
  eventSummary,
  feedSummary,
  individualCareReminders,
  individualEvents,
  individualFeedRecords,
  individualProductionRecords,
  productionSummary,
} from "../animalUtils";
import { useAnimals } from "../useAnimals";

const careEventTypes = new Set(["health", "medication", "vaccine", "worming", "injury", "weight"]);

export function IndividualAnimalDetailPage() {
  const { animalId } = useParams();
  const { data } = useAnimals();
  const animal = data.individuals.find((entry) => entry.id === animalId);

  if (!animal) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Animals" title="Animal not found" />
        <Link className="button button-secondary" to="/animals/individuals">
          <ArrowLeft size={18} />
          Back to individuals
        </Link>
      </div>
    );
  }

  const group = data.groups.find((entry) => entry.id === animal.groupId);
  const events = individualEvents(data, animal.id);
  const careEvents = events.filter((event) => careEventTypes.has(event.eventType));
  const feedRecords = individualFeedRecords(data, animal.id);
  const productionRecords = individualProductionRecords(data, animal.id);
  const reminders = individualCareReminders(data, animal.id);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${animal.species} - ${purposeLabel(animal.purpose)}`}
        title={animal.name}
        actions={
          <>
            <LinkButton to={`/animals/individuals/${animal.id}/edit`} variant="secondary">
              <Edit3 size={18} />
              Edit
            </LinkButton>
            <LinkButton to={`/animals/quick-log?animalId=${animal.id}`}>
              <ClipboardList size={18} />
              Log event
            </LinkButton>
          </>
        }
      >
        <p>{animal.notes || "Individual timeline for health, care, feed, production, and life events."}</p>
      </PageHeader>

      <section className="summary-strip" aria-label="Animal summary">
        <div>
          <span>Status</span>
          <strong>{statusLabel(animal.status)}</strong>
        </div>
        <div>
          <span>Group</span>
          <small>{group?.name || "No group"}</small>
        </div>
        <div>
          <span>Location</span>
          <small>{animal.location || "No location"}</small>
        </div>
        <div>
          <span>Birth or hatch</span>
          <small>{animal.birthHatchDate ? formatShortDate(animal.birthHatchDate) : "Not recorded"}</small>
        </div>
      </section>

      <section className="animal-dashboard-grid">
        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Key info</p>
            <h2>Record</h2>
          </div>
          <div className="compact-list">
            <div className="compact-row">
              <strong>{animal.breed || animal.species}</strong>
              <span>{animal.sex || "Sex not recorded"}</span>
              <small>{animal.acquiredDate ? `Acquired ${formatShortDate(animal.acquiredDate)}` : "Acquired date not recorded"}</small>
            </div>
            {animal.photoPlaceholder ? (
              <div className="compact-row">
                <strong>Photo placeholder</strong>
                <span>{animal.photoPlaceholder}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Care reminders</p>
              <h2>Upcoming</h2>
            </div>
            <Link to={`/animals/reminders?animalId=${animal.id}`}>Add</Link>
          </div>
          <div className="compact-list">
            {reminders.slice(0, 5).map((reminder) => (
              <Link to="/animals/reminders" className="compact-row" key={reminder.id}>
                <strong>{reminder.title}</strong>
                <span>{reminder.suggestedCadence || "No cadence"}</span>
                <small>{formatShortDate(reminder.nextDueDate)}</small>
              </Link>
            ))}
            {reminders.length === 0 ? <p className="muted">No care reminders for this animal.</p> : null}
          </div>
        </div>
      </section>

      <section className="animal-dashboard-grid">
        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Health and care</p>
              <h2>Care history</h2>
            </div>
            <Link to={`/animals/quick-log?animalId=${animal.id}`}>Log</Link>
          </div>
          <div className="compact-list">
            {careEvents.slice(0, 5).map((event) => (
              <Link to="/animals/timeline" className="compact-row" key={event.id}>
                <strong>{eventSummary(event)}</strong>
                <span>{event.notes || eventTypeLabel(event.eventType)}</span>
                <small>{formatShortDate(event.date)}</small>
              </Link>
            ))}
            {careEvents.length === 0 ? <p className="muted">No health or care events yet.</p> : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Timeline</p>
              <h2>All events</h2>
            </div>
            <Link to={`/animals/timeline?animalId=${animal.id}`}>View</Link>
          </div>
          <div className="compact-list">
            {events.slice(0, 5).map((event) => (
              <Link to="/animals/timeline" className="compact-row" key={event.id}>
                <strong>{eventSummary(event)}</strong>
                <span>{event.notes || "Timeline entry"}</span>
                <small>{formatShortDate(event.date)}</small>
              </Link>
            ))}
            {events.length === 0 ? <p className="muted">No timeline entries yet.</p> : null}
          </div>
        </div>
      </section>

      <section className="animal-dashboard-grid">
        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Feed records</p>
              <h2>Recent feed</h2>
            </div>
            <Link to={`/animals/feed-production?animalId=${animal.id}`}>
              <PackagePlus size={16} />
            </Link>
          </div>
          <div className="compact-list">
            {feedRecords.slice(0, 4).map((record) => (
              <Link to="/animals/feed-production" className="compact-row" key={record.id}>
                <strong>{feedSummary(record)}</strong>
                <span>{record.notes || "Feed log"}</span>
                <small>{formatShortDate(record.date)}</small>
              </Link>
            ))}
            {feedRecords.length === 0 ? <p className="muted">No feed records yet.</p> : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Production records</p>
              <h2>Recent output</h2>
            </div>
            <Link to={`/animals/feed-production?animalId=${animal.id}`}>Log</Link>
          </div>
          <div className="compact-list">
            {productionRecords.slice(0, 4).map((record) => (
              <Link to="/animals/feed-production" className="compact-row" key={record.id}>
                <strong>{productionSummary(record)}</strong>
                <span>{record.notes || "Production log"}</span>
                <small>{formatShortDate(record.date)}</small>
              </Link>
            ))}
            {productionRecords.length === 0 ? <p className="muted">No production records yet.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

