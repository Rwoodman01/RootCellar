import { ArrowRight, Bell, ClipboardList, Egg, Plus, Rabbit, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { eventTypeLabel } from "../constants";
import {
  activeGroups,
  activeIndividuals,
  dueCareReminders,
  dueFollowUps,
  recentProductionSummary,
  sortedEvents,
  sortedReminders,
  targetLabel,
} from "../animalUtils";
import { useAnimals } from "../useAnimals";

export function AnimalsOverviewPage() {
  const { data } = useAnimals();
  const activeGroupCount = activeGroups(data.groups).length;
  const activeIndividualCount = activeIndividuals(data.individuals).length;
  const reminders = sortedReminders(data.careReminders).slice(0, 4);
  const recentEvents = sortedEvents(data.events).slice(0, 5);
  const dueReminders = dueCareReminders(data.careReminders);
  const dueFollowUpEvents = dueFollowUps(data.events);
  const productionLines = recentProductionSummary(data.productionRecords);
  const isEmpty = data.groups.length === 0 && data.individuals.length === 0;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Animals"
        title="Living timelines for the animals in your care"
        actions={
          <>
            <LinkButton to="/animals/groups/new">
              <Plus size={18} />
              Add animal group
            </LinkButton>
            <LinkButton to="/animals/individuals/new" variant="secondary">
              <Rabbit size={18} />
              Add individual
            </LinkButton>
            <LinkButton to="/animals/quick-log" variant="secondary">
              <ClipboardList size={18} />
              Log event
            </LinkButton>
          </>
        }
      >
        <p>Groups for flocks and herds, individual records where names matter, and a simple logbook for care, feed, health, production, and losses.</p>
      </PageHeader>

      <section className="summary-strip" aria-label="Animals summary">
        <Link to="/animals/groups" className="summary-main">
          <span>Active groups</span>
          <strong>{activeGroupCount}</strong>
          <small>{data.groups.length} total group records</small>
          <ArrowRight size={18} />
        </Link>
        <Link to="/animals/individuals" className="summary-main">
          <span>Individuals</span>
          <strong>{activeIndividualCount}</strong>
          <small>{data.individuals.length} total animal records</small>
          <ArrowRight size={18} />
        </Link>
        <Link to="/animals/reminders" className="summary-main">
          <span>Upcoming care</span>
          <strong>{reminders.length}</strong>
          <small>{dueReminders.length} due now</small>
          <ArrowRight size={18} />
        </Link>
        <Link to="/animals/timeline" className="summary-main">
          <span>Recent events</span>
          <strong>{data.events.length}</strong>
          <small>Unified logbook</small>
          <ArrowRight size={18} />
        </Link>
      </section>

      {isEmpty ? (
        <EmptyState
          title="Start with the way you actually keep animals"
          action={
            <LinkButton to="/animals/groups/new">
              <Plus size={18} />
              Add first group
            </LinkButton>
          }
        >
          A laying flock can stay a group. Clover the goat can be an individual. You can use both.
        </EmptyState>
      ) : null}

      <section className="animal-dashboard-grid">
        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Care reminders</p>
              <h2>Upcoming dates</h2>
            </div>
            <Bell size={18} />
          </div>
          <div className="compact-list">
            {reminders.length ? (
              reminders.map((reminder) => (
                <Link to="/animals/reminders" className="compact-row" key={reminder.id}>
                  <strong>{reminder.title}</strong>
                  <span>{targetLabel(data, reminder)}</span>
                  <small>
                    {formatShortDate(reminder.nextDueDate)}
                    {reminder.suggestedCadence ? ` - ${reminder.suggestedCadence}` : ""}
                  </small>
                </Link>
              ))
            ) : (
              <p className="muted">No care reminders yet.</p>
            )}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Needs attention</p>
              <h2>Due and follow-up</h2>
            </div>
            <Stethoscope size={18} />
          </div>
          <div className="compact-list">
            {[...dueReminders.map((reminder) => ({ id: reminder.id, title: reminder.title, detail: targetLabel(data, reminder), date: reminder.nextDueDate })), ...dueFollowUpEvents.map((event) => ({ id: event.id, title: eventTypeLabel(event.eventType), detail: targetLabel(data, event), date: event.followUpDate || event.date }))].slice(0, 5).map((entry) => (
              <Link to="/animals/timeline" className="compact-row" key={entry.id}>
                <strong>{entry.title}</strong>
                <span>{entry.detail}</span>
                <small>{formatShortDate(entry.date)}</small>
              </Link>
            ))}
            {dueReminders.length === 0 && dueFollowUpEvents.length === 0 ? <p className="muted">Nothing is due right now.</p> : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Production</p>
              <h2>Last 30 days</h2>
            </div>
            <Egg size={18} />
          </div>
          <div className="compact-list">
            {productionLines.length ? (
              productionLines.slice(0, 5).map((line) => (
                <Link to="/animals/feed-production" className="compact-row" key={line}>
                  <strong>{line}</strong>
                  <span>Recorded from animal production logs</span>
                </Link>
              ))
            ) : (
              <p className="muted">Production totals appear after you log eggs, milk, meat, fiber, honey, or other output.</p>
            )}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Recent events</p>
              <h2>Animal memory</h2>
            </div>
            <Link to="/animals/timeline">Open</Link>
          </div>
          <div className="compact-list">
            {recentEvents.length ? (
              recentEvents.map((event) => (
                <Link to="/animals/timeline" className="compact-row" key={event.id}>
                  <strong>{eventTypeLabel(event.eventType)}</strong>
                  <span>{targetLabel(data, event)}</span>
                  <small>{formatShortDate(event.date)}</small>
                </Link>
              ))
            ) : (
              <p className="muted">No events logged yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

