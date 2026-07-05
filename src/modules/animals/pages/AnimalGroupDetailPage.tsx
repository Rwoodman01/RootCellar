import { ArrowLeft, ClipboardList, Edit3, PackagePlus, Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { eventTypeLabel, purposeLabel, statusLabel } from "../constants";
import {
  feedSummary,
  groupCareReminders,
  groupEvents,
  groupFeedRecords,
  groupIndividuals,
  groupProductionRecords,
  productionSummary,
  targetLabel,
} from "../animalUtils";
import { useAnimals } from "../useAnimals";

export function AnimalGroupDetailPage() {
  const { groupId } = useParams();
  const { data, adjustGroupCount } = useAnimals();
  const group = data.groups.find((entry) => entry.id === groupId);
  const [nextCount, setNextCount] = useState(group?.count || 0);
  const [countNote, setCountNote] = useState("");

  if (!group) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Animals" title="Group not found" />
        <Link className="button button-secondary" to="/animals/groups">
          <ArrowLeft size={18} />
          Back to groups
        </Link>
      </div>
    );
  }

  const linkedIndividuals = groupIndividuals(data, group.id);
  const events = groupEvents(data, group.id);
  const feedRecords = groupFeedRecords(data, group.id);
  const productionRecords = groupProductionRecords(data, group.id);
  const reminders = groupCareReminders(data, group.id);

  const submitCount = (event: FormEvent) => {
    event.preventDefault();
    adjustGroupCount(group.id, nextCount, countNote);
    setCountNote("");
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${group.species} - ${purposeLabel(group.purpose)}`}
        title={group.name}
        actions={
          <>
            <LinkButton to={`/animals/groups/${group.id}/edit`} variant="secondary">
              <Edit3 size={18} />
              Edit
            </LinkButton>
            <LinkButton to={`/animals/quick-log?groupId=${group.id}`}>
              <ClipboardList size={18} />
              Log event
            </LinkButton>
          </>
        }
      >
        <p>{group.notes || "Group record for care, feed, production, health events, count changes, and losses."}</p>
      </PageHeader>

      <section className="summary-strip" aria-label="Group summary">
        <div>
          <span>Count</span>
          <strong>{group.count}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{statusLabel(group.status)}</strong>
        </div>
        <div>
          <span>Location</span>
          <small>{group.location || "No location"}</small>
        </div>
        <div>
          <span>Started</span>
          <small>{formatShortDate(group.startDate)}</small>
        </div>
      </section>

      <section className="animal-dashboard-grid">
        <form className="form-panel" onSubmit={submitCount}>
          <div className="section-heading">
            <p className="eyebrow">Count adjustment</p>
            <h2>Update the group count</h2>
          </div>
          <div className="form-grid">
            <label>
              Current count
              <input type="number" min="0" step="1" value={nextCount} onChange={(event) => setNextCount(Number(event.target.value))} />
            </label>
            <label>
              Reason
              <input value={countNote} onChange={(event) => setCountNote(event.target.value)} placeholder="Processed 4, lost 1, sold 2" />
            </label>
          </div>
          <Button type="submit">
            <Plus size={18} />
            Save count note
          </Button>
        </form>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Individuals</p>
              <h2>Linked animals</h2>
            </div>
            <Link to={`/animals/individuals/new?groupId=${group.id}`}>Add</Link>
          </div>
          <div className="compact-list">
            {linkedIndividuals.length ? (
              linkedIndividuals.map((animal) => (
                <Link to={`/animals/individuals/${animal.id}`} className="compact-row" key={animal.id}>
                  <strong>{animal.name}</strong>
                  <span>{animal.breed || animal.species}</span>
                  <small>{statusLabel(animal.status)}</small>
                </Link>
              ))
            ) : (
              <p className="muted">No individual animals linked to this group.</p>
            )}
          </div>
        </div>
      </section>

      <section className="animal-dashboard-grid">
        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Timeline</p>
              <h2>Group events</h2>
            </div>
            <Link to={`/animals/timeline?groupId=${group.id}`}>View</Link>
          </div>
          <div className="compact-list">
            {events.slice(0, 5).map((entry) => (
              <Link to="/animals/timeline" className="compact-row" key={entry.id}>
                <strong>{eventTypeLabel(entry.eventType)}</strong>
                <span>{entry.notes || targetLabel(data, entry)}</span>
                <small>{formatShortDate(entry.date)}</small>
              </Link>
            ))}
            {events.length === 0 ? <p className="muted">No timeline entries yet.</p> : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Care reminders</p>
              <h2>Upcoming</h2>
            </div>
            <Link to={`/animals/reminders?groupId=${group.id}`}>Add</Link>
          </div>
          <div className="compact-list">
            {reminders.slice(0, 5).map((reminder) => (
              <Link to="/animals/reminders" className="compact-row" key={reminder.id}>
                <strong>{reminder.title}</strong>
                <span>{reminder.suggestedCadence || "No cadence"}</span>
                <small>{formatShortDate(reminder.nextDueDate)}</small>
              </Link>
            ))}
            {reminders.length === 0 ? <p className="muted">No care reminders for this group.</p> : null}
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
            <Link to={`/animals/feed-production?groupId=${group.id}`}>
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
            <Link to={`/animals/feed-production?groupId=${group.id}`}>Log</Link>
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

