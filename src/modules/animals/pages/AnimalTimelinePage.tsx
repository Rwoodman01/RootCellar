import { ClipboardList, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { ANIMAL_EVENT_OPTIONS, eventTypeLabel } from "../constants";
import { eventSummary, getAnimalTargets, sortedEvents, targetLabel, targetSpecies, targetValue } from "../animalUtils";
import type { AnimalEventType } from "../types";
import { useAnimals } from "../useAnimals";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";

export function AnimalTimelinePage() {
  const { data } = useAnimals();
  const [searchParams] = useSearchParams();
  const initialTarget = searchParams.get("animalId")
    ? `animal:${searchParams.get("animalId")}`
    : searchParams.get("groupId")
      ? `group:${searchParams.get("groupId")}`
      : "";
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState(initialTarget);
  const [eventTypeFilter, setEventTypeFilter] = useState<AnimalEventType | "">("");
  const species = Array.from(new Set([...data.groups.map((group) => group.species), ...data.individuals.map((animal) => animal.species)].filter(Boolean))).sort();
  const targets = getAnimalTargets(data);
  const events = sortedEvents(data.events).filter((event) => {
    if (speciesFilter && targetSpecies(data, event) !== speciesFilter) return false;
    if (targetFilter && targetValue(event) !== targetFilter) return false;
    if (eventTypeFilter && event.eventType !== eventTypeFilter) return false;
    return true;
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Animal timeline"
        title="The unified animal logbook"
        actions={
          <LinkButton to="/animals/quick-log">
            <Plus size={18} />
            Quick log
          </LinkButton>
        }
      >
        <p>Filter the living timeline by species, group or individual, and event type.</p>
      </PageHeader>

      <section className="filter-panel">
        <label>
          Species
          <select value={speciesFilter} onChange={(event) => setSpeciesFilter(event.target.value)}>
            <option value="">All species</option>
            {species.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
        <label>
          Group or animal
          <select value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)}>
            <option value="">All records</option>
            {targets.map((target) => (
              <option key={`${target.type}:${target.id}`} value={`${target.type}:${target.id}`}>
                {target.type === "group" ? "Group" : "Individual"} - {target.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Event type
          <select value={eventTypeFilter} onChange={(event) => setEventTypeFilter(event.target.value as AnimalEventType | "")}>
            <option value="">All event types</option>
            {ANIMAL_EVENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Link className="button button-secondary" to="/animals/quick-log">
          <ClipboardList size={18} />
          Add quick event
        </Link>
      </section>

      {data.events.length === 0 ? (
        <EmptyState
          title="No animal events yet"
          action={
            <LinkButton to="/animals/quick-log">
              <Plus size={18} />
              Log first event
            </LinkButton>
          }
        >
          Record feed changes, health notes, production, moves, births, deaths, processing, sales, or plain notes.
        </EmptyState>
      ) : (
        <section className="item-list">
          {events.map((event) => (
            <article className="item-card" key={event.id}>
              <div className="item-card-top">
                <div>
                  <span>{eventTypeLabel(event.eventType)}</span>
                  <h3>{targetLabel(data, event)}</h3>
                  <p>{event.notes || eventSummary(event)}</p>
                  <small>
                    {formatShortDate(event.date)}
                    {event.followUpDate ? ` - follow up ${formatShortDate(event.followUpDate)}` : ""}
                  </small>
                </div>
              </div>
              {event.quantityValue !== undefined || event.linkedChoreId ? (
                <div className="estimate-pills">
                  {event.quantityValue !== undefined ? (
                    <span>
                      <strong>{event.quantityValue}</strong>
                      {event.unit || "value"}
                    </span>
                  ) : null}
                  {event.linkedChoreId ? <span>Chore link placeholder</span> : null}
                </div>
              ) : null}
            </article>
          ))}
          {events.length === 0 ? <p className="muted">No events match those filters.</p> : null}
        </section>
      )}
    </div>
  );
}

