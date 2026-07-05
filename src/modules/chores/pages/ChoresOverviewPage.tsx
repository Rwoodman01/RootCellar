import { ArrowRight, CalendarDays, ClipboardCheck, ListChecks, Plus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { ChoreActionCard } from "../components/ChoreActionCard";
import { MemberBadge } from "../components/MemberBadge";
import { recurrenceTypeLabel } from "../constants";
import {
  getChoreUrgency,
  getChoresByPerson,
  getCompletionStats,
  getSlippingChores,
  getTodayChores,
  getUnownedChores,
  getUpcomingSeasonChores,
  getWeeklyChoreReview,
} from "../choreUtils";
import { useChores } from "../useChores";

export function ChoresOverviewPage() {
  const { data, activeMember, setActiveMember, completeChore, skipChore } = useChores();
  const today = getTodayChores(data);
  const stats = getCompletionStats(data);
  const ripeChores = data.chores
    .filter((chore) => chore.status === "active" && chore.recurrenceType === "decay")
    .filter((chore) => {
      const urgency = getChoreUrgency(chore, data.completions, undefined, data);
      return urgency.status === "ready_soon" || urgency.status === "ready" || urgency.status === "getting_ripe";
    })
    .slice(0, 4);
  const upcomingSeason = getUpcomingSeasonChores(data).slice(0, 4);
  const slipping = getSlippingChores(data).slice(0, 4);
  const unowned = getUnownedChores(data).slice(0, 4);
  const review = getWeeklyChoreReview(data);
  const byPerson = getChoresByPerson(data).filter((entry) => entry.chores.length);
  const burstProjects = data.chores.filter((chore) => chore.status === "active" && chore.recurrenceType === "burst").slice(0, 4);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Chores"
        title="Who owns what, what is ripe, and what belongs in the Huddle"
        actions={
          <>
            <LinkButton to="/chores/new">
              <Plus size={18} />
              Add chore
            </LinkButton>
            <LinkButton to="/chores/members" variant="secondary">
              <UsersRound size={18} />
              Add family member
            </LinkButton>
            <LinkButton to="/chores/kid-mode" variant="secondary">
              <ClipboardCheck size={18} />
              Kid Mode
            </LinkButton>
            <LinkButton to="/chores/review" variant="secondary">
              <CalendarDays size={18} />
              Weekly review
            </LinkButton>
          </>
        }
      >
        <p>Rootcellar chores are a barn whiteboard with memory: one owner, a calm backup, and recurrence that understands laundry, land, weather placeholders, seasons, and project pushes.</p>
      </PageHeader>

      <section className="focus-band">
        <div>
          <p className="eyebrow">Today</p>
          <h2>{today.length ? `${today.length} thing${today.length === 1 ? "" : "s"} need attention` : "Nothing is shouting today"}</h2>
          <p>{stats.completedThisWeek} completed this week, {stats.skippedThisWeek} stood down, and {review.agendaItems.length || 0} item{review.agendaItems.length === 1 ? "" : "s"} are on the Huddle list.</p>
        </div>
        <div className="focus-actions">
          {data.members.length ? (
            <label className="inline-select">
              Acting as
              <select value={activeMember?.id || ""} onChange={(event) => setActiveMember(event.target.value)}>
                {data.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <LinkButton to="/chores/today">
            <ListChecks size={18} />
            Open Today
          </LinkButton>
        </div>
      </section>

      {data.members.length === 0 ? (
        <EmptyState
          title="Start with the people, then the work"
          action={
            <LinkButton to="/chores/members">
              <UsersRound size={18} />
              Add first family member
            </LinkButton>
          }
        >
          Chores V1 keeps ownership visible. Add the household members who can own or back up work, then create the first chore.
        </EmptyState>
      ) : (
        <>
          <section className="summary-strip" aria-label="Chores summary">
            <Link to="/chores/today" className="summary-main">
              <span>Due today</span>
              <strong>{today.length}</strong>
              <small>Grouped by person</small>
              <ArrowRight size={18} />
            </Link>
            <Link to="/chores/list" className="summary-main">
              <span>Getting ripe</span>
              <strong>{ripeChores.length}</strong>
              <small>No red badges</small>
              <ArrowRight size={18} />
            </Link>
            <Link to="/chores/templates" className="summary-main">
              <span>Seasonal</span>
              <strong>{upcomingSeason.length}</strong>
              <small>Frost and custom anchors</small>
              <ArrowRight size={18} />
            </Link>
            <Link to="/chores/review" className="summary-main">
              <span>Huddle list</span>
              <strong>{review.agendaItems.length}</strong>
              <small>Ownership and slipping</small>
              <ArrowRight size={18} />
            </Link>
          </section>

          <section className="chore-dashboard-grid">
            <div className="pantry-panel">
              <div className="section-heading section-heading-row">
                <div>
                  <p className="eyebrow">Today</p>
                  <h2>Big tap, then move on</h2>
                </div>
                <Link to="/chores/today">Open</Link>
              </div>
              <div className="compact-list">
                {today.length ? (
                  today.slice(0, 4).map((chore) => (
                    <ChoreActionCard key={chore.id} chore={chore} data={data} actorMemberId={activeMember?.id} compact onComplete={completeChore} onSkip={skipChore} />
                  ))
                ) : (
                  <p className="muted">No due chores. The board is quiet.</p>
                )}
              </div>
            </div>

            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">By person</p>
                <h2>Visible ownership</h2>
              </div>
              <div className="compact-list">
                {byPerson.map((entry) => (
                  <Link to="/chores/list" className="compact-row chore-person-row" key={entry.member?.id || "unowned"}>
                    <MemberBadge member={entry.member} />
                    <strong>{entry.chores.length}</strong>
                    <span>{entry.chores.slice(0, 3).map((chore) => chore.title).join(", ")}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Getting ripe</p>
                <h2>Decay chores</h2>
              </div>
              <div className="compact-list">
                {ripeChores.length ? (
                  ripeChores.map((chore) => {
                    const urgency = getChoreUrgency(chore, data.completions, undefined, data);
                    return (
                      <Link to={`/chores/${chore.id}`} className="compact-row" key={chore.id}>
                        <strong>{chore.title}</strong>
                        <span>{urgency.label}</span>
                        <small>{urgency.daysElapsed || 0} days into the cycle</small>
                      </Link>
                    );
                  })
                ) : (
                  <p className="muted">Nothing is ripe yet.</p>
                )}
              </div>
            </div>

            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Huddle prep</p>
                <h2>Unowned and slipping</h2>
              </div>
              <div className="compact-list">
                {[...unowned, ...slipping].slice(0, 5).map((chore) => (
                  <Link to={`/chores/${chore.id}`} className="compact-row" key={chore.id}>
                    <strong>{chore.title}</strong>
                    <span>{unowned.some((entry) => entry.id === chore.id) ? "Needs owner" : "This one keeps slipping"}</span>
                    <small>{chore.location || recurrenceTypeLabel(chore.recurrenceType)}</small>
                  </Link>
                ))}
                {unowned.length === 0 && slipping.length === 0 ? <p className="muted">No ownership gaps on the board.</p> : null}
              </div>
            </div>

            <div className="pantry-panel">
              <div className="section-heading section-heading-row">
                <div>
                  <p className="eyebrow">Seasonal</p>
                  <h2>Coming work</h2>
                </div>
                <Link to="/chores/templates">Setup</Link>
              </div>
              <div className="compact-list">
                {upcomingSeason.length ? (
                  upcomingSeason.map((entry) => (
                    <Link to={`/chores/${entry.chore.id}`} className="compact-row" key={entry.chore.id}>
                      <strong>{entry.chore.title}</strong>
                      <span>{entry.daysUntilDue === 0 ? "Ready" : `${entry.daysUntilDue} days out`}</span>
                      <small>{formatShortDate(entry.dueDate)}</small>
                    </Link>
                  ))
                ) : (
                  <p className="muted">No seasonal chores inside the next 45 days.</p>
                )}
              </div>
            </div>

            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Burst work</p>
                <h2>Project checklists</h2>
              </div>
              <div className="compact-list">
                {burstProjects.length ? (
                  burstProjects.map((chore) => {
                    const items = data.burstItems.filter((item) => item.choreId === chore.id);
                    const done = items.filter((item) => item.completedAt).length;
                    return (
                      <Link to={`/chores/${chore.id}`} className="compact-row" key={chore.id}>
                        <strong>{chore.title}</strong>
                        <span>{done} of {items.length} line items done</span>
                        <small>{chore.location || "Project window"}</small>
                      </Link>
                    );
                  })
                ) : (
                  <p className="muted">No burst projects yet. Templates can draft canning weekend or butcher day.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
