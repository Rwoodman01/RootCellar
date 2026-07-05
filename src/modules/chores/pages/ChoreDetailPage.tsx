import { ArrowLeft, Archive, Edit, Pause, Play, RotateCcw, Wrench } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { ChoreActionCard } from "../components/ChoreActionCard";
import { MemberBadge } from "../components/MemberBadge";
import { choreStatusLabel, recurrenceTypeLabel, skipReasonLabel } from "../constants";
import { backupLabel, completionLine, getChoreUrgency, recurrenceSummary } from "../choreUtils";
import type { BurstRecurrenceParams } from "../types";
import { useChore, useChores } from "../useChores";

export function ChoreDetailPage() {
  const { choreId } = useParams();
  const chore = useChore(choreId);
  const { data, activeMember, completeChore, skipChore, updateChoreStatus, toggleBurstItem } = useChores();

  if (!chore) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Chores" title="Chore not found" />
        <LinkButton to="/chores/list" variant="secondary">
          <ArrowLeft size={18} />
          Back to chores
        </LinkButton>
      </div>
    );
  }

  const owner = data.members.find((member) => member.id === chore.ownerMemberId);
  const backup = data.members.find((member) => member.id === chore.backupMemberId);
  const urgency = getChoreUrgency(chore, data.completions, undefined, data);
  const completions = data.completions.filter((completion) => completion.choreId === chore.id).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const skipHistory = completions.filter((completion) => completion.action === "skipped");
  const brokenSkips = skipHistory.filter((completion) => completion.skippedReason === "broken");
  const burstItems = data.burstItems.filter((item) => item.choreId === chore.id);
  const burstParams = chore.recurrenceType === "burst" ? (chore.recurrenceParams as BurstRecurrenceParams) : null;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={recurrenceTypeLabel(chore.recurrenceType)}
        title={chore.title}
        actions={
          <>
            <LinkButton to="/chores/list" variant="secondary">
              <ArrowLeft size={18} />
              List
            </LinkButton>
            <LinkButton to={`/chores/${chore.id}/edit`}>
              <Edit size={18} />
              Edit
            </LinkButton>
          </>
        }
      >
        <p>{recurrenceSummary(chore, data)}</p>
      </PageHeader>

      <section className="summary-strip" aria-label="Chore detail summary">
        <div>
          <span>Status</span>
          <strong>{choreStatusLabel(chore.status)}</strong>
          <small>{urgency.label}</small>
        </div>
        <div>
          <span>Owner</span>
          <strong>{owner?.name || "Unowned"}</strong>
          <small>{backupLabel(chore, data.members)}</small>
        </div>
        <div>
          <span>Effort</span>
          <strong>{chore.effort}</strong>
          <small>{chore.minAge ? `Minimum age ${chore.minAge}` : "No age floor"}</small>
        </div>
        <div>
          <span>Verification</span>
          <strong>{chore.verification === "trust" ? "Trust" : "Photo opt-in"}</strong>
          <small>No approval queue</small>
        </div>
      </section>

      <section className="split-layout">
        <div className="page-stack">
          <ChoreActionCard chore={chore} data={data} actorMemberId={activeMember?.id} onComplete={completeChore} onSkip={skipChore} />

          {burstItems.length ? (
            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Burst checklist</p>
                <h2>{burstParams ? `${formatShortDate(burstParams.windowStart)} to ${formatShortDate(burstParams.windowEnd)}` : "Project line items"}</h2>
              </div>
              <div className="checkbox-list">
                {burstItems.map((item) => {
                  const member = data.members.find((entry) => entry.id === item.ownerMemberId);
                  return (
                    <label key={item.id}>
                      <input type="checkbox" checked={Boolean(item.completedAt)} onChange={() => toggleBurstItem(item.id, activeMember?.id || item.ownerMemberId)} />
                      <span>
                        {item.title}
                        <small>{member ? ` · ${member.name}` : ""}{item.completedAt ? ` · done ${formatShortDate(item.completedAt.slice(0, 10))}` : ""}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="pantry-panel">
            <div className="section-heading">
              <p className="eyebrow">History</p>
              <h2>Completions and skips</h2>
            </div>
            <div className="compact-list">
              {completions.slice(0, 12).map((completion) => (
                <div className="compact-row" key={completion.id}>
                  <strong>{completionLine(completion, data)}</strong>
                  {completion.note ? <span>{completion.note}</span> : null}
                </div>
              ))}
              {completions.length === 0 ? <p className="muted">No one has logged this chore yet.</p> : null}
            </div>
          </div>
        </div>

        <aside className="page-stack">
          <div className="pantry-panel">
            <div className="section-heading">
              <p className="eyebrow">Ownership</p>
              <h2>Plain and visible</h2>
            </div>
            <div className="compact-list">
              <div className="compact-row">
                <MemberBadge member={owner} label={owner ? `Owned by ${owner.name}` : "Needs owner"} />
                {backup ? <MemberBadge member={backup} label={`Backup: ${backup.name}`} /> : <span className="muted">No backup assigned</span>}
              </div>
              <div className="compact-row">
                <strong>{chore.location || "No zone"}</strong>
                <span>{chore.seasonWindow || "No season window"}</span>
                {chore.linkedEntity ? <small>{chore.linkedEntity.label || chore.linkedEntity.type}</small> : <small>No linked record</small>}
              </div>
            </div>
          </div>

          <div className="pantry-panel">
            <div className="section-heading">
              <p className="eyebrow">How we do it</p>
              <h2>Household notes</h2>
            </div>
            <p>{chore.howWeDoIt || "No notes yet."}</p>
          </div>

          <div className="pantry-panel">
            <div className="section-heading">
              <p className="eyebrow">Status controls</p>
              <h2>Pause or archive</h2>
            </div>
            <div className="button-row">
              {chore.status === "active" ? (
                <Button type="button" variant="secondary" onClick={() => updateChoreStatus(chore.id, "paused")}>
                  <Pause size={18} />
                  Pause
                </Button>
              ) : (
                <Button type="button" onClick={() => updateChoreStatus(chore.id, "active")}>
                  <Play size={18} />
                  Activate
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={() => updateChoreStatus(chore.id, "archived")}>
                <Archive size={18} />
                Archive
              </Button>
            </div>
          </div>

          <div className="pantry-panel">
            <div className="section-heading">
              <p className="eyebrow">Skip history</p>
              <h2>{skipHistory.length ? `${skipHistory.length} skip${skipHistory.length === 1 ? "" : "s"}` : "No skips"}</h2>
            </div>
            <div className="compact-list">
              {skipHistory.slice(0, 5).map((completion) => (
                <div className="compact-row" key={completion.id}>
                  <strong>{skipReasonLabel(completion.skippedReason)}</strong>
                  <span>{new Date(completion.completedAt).toLocaleDateString()}</span>
                </div>
              ))}
              {brokenSkips.length >= 2 ? (
                <div className="disclaimer fixit-note">
                  <Wrench size={18} />
                  Move this to Fix-It later? The structure is ready; Fix-It is not a V1 module.
                </div>
              ) : null}
            </div>
          </div>

          {chore.recurrenceType === "decay" ? (
            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Decay math</p>
                <h2>Ripe, not shameful</h2>
              </div>
              <p>
                {Math.round(urgency.ratio * 100)}% of the usual interval. The task surfaces at 80%, and completing resets from the completed date.
              </p>
              <div className="button-row">
                <Button type="button" variant="secondary" onClick={() => completeChore(chore.id, activeMember?.id)}>
                  <RotateCcw size={18} />
                  Reset by completing
                </Button>
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
