import { ArrowLeft, CalendarDays, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { recurrenceTypeLabel, skipReasonLabel } from "../constants";
import { getWeeklyChoreReview } from "../choreUtils";
import { useChores } from "../useChores";

export function WeeklyChoreReviewPage() {
  const { data } = useChores();
  const review = getWeeklyChoreReview(data);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Weekly Huddle"
        title="What should the family discuss?"
        actions={
          <LinkButton to="/chores" variant="secondary">
            <ArrowLeft size={18} />
            Chores
          </LinkButton>
        }
      >
        <p>Load, ownership gaps, slipping work, skip reasons, seasonal work, and burst projects. Reassignment happens at the table.</p>
      </PageHeader>

      <section className="focus-band">
        <div>
          <p className="eyebrow">Suggested agenda</p>
          <h2>{review.agendaItems.length ? `${review.agendaItems.length} item${review.agendaItems.length === 1 ? "" : "s"} to cover` : "The board is steady"}</h2>
          <p>{review.agendaItems[0] || "No unowned or slipping chores surfaced this week."}</p>
        </div>
        <CalendarDays size={28} />
      </section>

      <section className="chore-dashboard-grid">
        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">By-person load</p>
            <h2>Who owns what</h2>
          </div>
          <div className="compact-list">
            {review.byPersonLoad.map((entry) => (
              <div className="compact-row" key={entry.member?.id || "unowned"}>
                <strong>{entry.member?.name || "Unowned"}</strong>
                <span>{entry.activeOwned} active · {entry.dueToday} due today · {entry.readySoon} ready soon</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Unowned chores</p>
            <h2>Needs a person</h2>
          </div>
          <div className="compact-list">
            {review.unownedChores.map((chore) => (
              <Link to={`/chores/${chore.id}`} className="compact-row" key={chore.id}>
                <strong>{chore.title}</strong>
                <span>{chore.location || recurrenceTypeLabel(chore.recurrenceType)}</span>
              </Link>
            ))}
            {review.unownedChores.length === 0 ? <p className="muted">Every active chore has an owner.</p> : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Slipping</p>
            <h2>This one keeps slipping</h2>
          </div>
          <div className="compact-list">
            {review.slippingChores.map((chore) => (
              <Link to={`/chores/${chore.id}`} className="compact-row" key={chore.id}>
                <strong>{chore.title}</strong>
                <span>{chore.location || recurrenceTypeLabel(chore.recurrenceType)}</span>
              </Link>
            ))}
            {review.slippingChores.length === 0 ? <p className="muted">No slipping patterns right now.</p> : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Skipped this week</p>
            <h2>Reasons, not blame</h2>
          </div>
          <div className="compact-list">
            {review.skippedChores.slice(0, 8).map((completion) => {
              const chore = data.chores.find((entry) => entry.id === completion.choreId);
              return (
                <Link to={chore ? `/chores/${chore.id}` : "/chores/list"} className="compact-row" key={completion.id}>
                  <strong>{chore?.title || "Removed chore"}</strong>
                  <span>{skipReasonLabel(completion.skippedReason)}</span>
                  <small>{new Date(completion.completedAt).toLocaleDateString()}</small>
                </Link>
              );
            })}
            {review.skippedChores.length === 0 ? <p className="muted">No skip reasons logged this week.</p> : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Seasonal work</p>
            <h2>Coming soon</h2>
          </div>
          <div className="compact-list">
            {review.upcomingSeasonChores.map((entry) => (
              <Link to={`/chores/${entry.chore.id}`} className="compact-row" key={entry.chore.id}>
                <strong>{entry.chore.title}</strong>
                <span>{entry.daysUntilDue === 0 ? "Ready" : `${entry.daysUntilDue} days out`}</span>
                <small>{formatShortDate(entry.dueDate)}</small>
              </Link>
            ))}
            {review.upcomingSeasonChores.length === 0 ? <p className="muted">No seasonal chores inside 45 days.</p> : null}
          </div>
        </div>

        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Burst projects</p>
            <h2>Windows and line items</h2>
          </div>
          <div className="compact-list">
            {review.burstProjects.map((entry) => (
              <Link to={`/chores/${entry.chore.id}`} className="compact-row" key={entry.chore.id}>
                <strong>{entry.chore.title}</strong>
                <span>{entry.completedItems} of {entry.totalItems} items done</span>
              </Link>
            ))}
            {review.burstProjects.length === 0 ? <p className="muted">No burst project window is close.</p> : null}
          </div>
        </div>
      </section>

      {review.fixItCandidates.length ? (
        <section className="settings-panel">
          <h2>
            <Wrench size={18} />
            Fix-It placeholder
          </h2>
          <p>These chores have repeated “broken” skip reasons. Rootcellar can later offer to move them into Fix-It; V1 only surfaces the pattern.</p>
          <div className="compact-list">
            {review.fixItCandidates.map((chore) => (
              <Link to={`/chores/${chore.id}`} className="compact-row" key={chore.id}>
                <strong>{chore.title}</strong>
                <span>Move this to Fix-It later?</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
