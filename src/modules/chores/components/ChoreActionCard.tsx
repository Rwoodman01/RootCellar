import { CheckCircle2, SkipForward } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { SKIP_REASON_OPTIONS, recurrenceTypeLabel } from "../constants";
import { getChoreUrgency, ownerLabel, recurrenceSummary } from "../choreUtils";
import type { Chore, ChoreData, ChoreSkippedReason } from "../types";
import { MemberBadge } from "./MemberBadge";

interface ChoreActionCardProps {
  chore: Chore;
  data: ChoreData;
  actorMemberId?: string;
  compact?: boolean;
  showActions?: boolean;
  onComplete?: (choreId: string, memberId?: string) => void;
  onSkip?: (choreId: string, reason: ChoreSkippedReason, memberId?: string) => void;
}

export function ChoreActionCard({ chore, data, actorMemberId, compact = false, showActions = true, onComplete, onSkip }: ChoreActionCardProps) {
  const [skipReason, setSkipReason] = useState<ChoreSkippedReason>("not_needed");
  const urgency = useMemo(() => getChoreUrgency(chore, data.completions, undefined, data), [chore, data]);
  const owner = data.members.find((member) => member.id === chore.ownerMemberId);

  return (
    <article className={compact ? "chore-card chore-card-compact" : "chore-card"}>
      <div className="chore-card-main">
        <div className="chore-card-title-row">
          <MemberBadge member={owner} />
          <span className={`chore-status-pill chore-status-${urgency.status}`}>{urgency.label}</span>
        </div>
        <Link to={`/chores/${chore.id}`} className="chore-title-link">
          {chore.title}
        </Link>
        <p>
          {recurrenceTypeLabel(chore.recurrenceType)} · {recurrenceSummary(chore, data)} · {ownerLabel(chore, data.members)}
        </p>
        {chore.location ? <small>{chore.location}</small> : null}
        <div className="urgency-meter" aria-label={`${chore.title} urgency ${Math.round(urgency.fill * 100)} percent`}>
          <span style={{ width: `${Math.round(urgency.fill * 100)}%` }} />
        </div>
      </div>
      {showActions ? (
        <div className="chore-actions">
          <Button type="button" onClick={() => onComplete?.(chore.id, actorMemberId)} aria-label={`Complete ${chore.title}`}>
            <CheckCircle2 size={18} />
            Complete
          </Button>
          <div className="skip-action">
            <select value={skipReason} onChange={(event) => setSkipReason(event.target.value as ChoreSkippedReason)} aria-label={`Skip reason for ${chore.title}`}>
              {SKIP_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={() => onSkip?.(chore.id, skipReason, actorMemberId)} aria-label={`Skip ${chore.title}`}>
              <SkipForward size={18} />
              Skip
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
