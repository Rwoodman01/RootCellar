import { ArrowRight, ListChecks, Plus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { ChoreActionCard } from "../components/ChoreActionCard";
import { MemberBadge } from "../components/MemberBadge";
import { getChoreUrgency, getChoresByPerson, getTodayChores } from "../choreUtils";
import { useChores } from "../useChores";

export function ChoresOverviewPage() {
  const { data, activeMember, setActiveMember, completeChore, skipChore } = useChores();
  const today = getTodayChores(data);
  const ripeChores = data.chores
    .filter((chore) => chore.status === "active" && chore.recurrenceType === "decay")
    .filter((chore) => {
      const urgency = getChoreUrgency(chore, data.completions, undefined, data);
      return urgency.status === "ready_soon" || urgency.status === "ready" || urgency.status === "getting_ripe";
    });
  const byPerson = getChoresByPerson(data).filter((entry) => entry.chores.length);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Chores"
        title="Who owns what, and what is ripe"
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
          </>
        }
      >
        <p>One owner, a calm backup, and recurrence that understands laundry, land, weather, seasons, and project pushes.</p>
      </PageHeader>

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
          </section>

          <section className="chore-dashboard-grid">
            <div className="pantry-panel">
              <div className="section-heading section-heading-row">
                <div>
                  <p className="eyebrow">Today</p>
                  <h2>Big tap, then move on</h2>
                </div>
                <Link to="/chores/today">
                  <ListChecks size={16} /> Open
                </Link>
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
                {byPerson.map((entry) => (
                  <Link to="/chores/list" className="compact-row chore-person-row" key={entry.member?.id || "unowned"}>
                    <MemberBadge member={entry.member} />
                    <strong>{entry.chores.length}</strong>
                    <span>{entry.chores.slice(0, 3).map((chore) => chore.title).join(", ")}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
