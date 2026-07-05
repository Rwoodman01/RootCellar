import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { ChoreActionCard } from "../components/ChoreActionCard";
import { getChoreUrgency, getTodayChores } from "../choreUtils";
import { useChores } from "../useChores";

export function KidModePage() {
  const { data, activeMember, setActiveMember, completeChore, skipChore } = useChores();
  const kidMembers = data.members.filter((member) => member.role === "kid" || member.role === "teen");
  const selectable = kidMembers.length ? kidMembers : data.members;
  const selected = activeMember && selectable.some((member) => member.id === activeMember.id) ? activeMember : selectable[0];
  const due = getTodayChores(data).filter((chore) => chore.ownerMemberId === selected?.id);
  const ripe = data.chores
    .filter((chore) => chore.status === "active" && chore.ownerMemberId === selected?.id)
    .filter((chore) => {
      const urgency = getChoreUrgency(chore, data.completions, undefined, data);
      return urgency.status === "ready_soon" || urgency.status === "getting_ripe";
    });
  const visible = Array.from(new Map([...due, ...ripe].map((chore) => [chore.id, chore])).values());

  return (
    <div className="page-stack kid-mode-page">
      <PageHeader
        eyebrow="Kid Mode"
        title={selected ? `${selected.name}'s board` : "Choose a worker"}
        actions={
          <LinkButton to="/chores" variant="secondary">
            <ArrowLeft size={18} />
            Chores
          </LinkButton>
        }
      >
        <p>Only that person's chores, big tiles, one-tap complete, trust by default. No points, coins, streaks, pets, or approval queue.</p>
      </PageHeader>

      {selectable.length ? (
        <section className="focus-band">
          <div>
            <p className="eyebrow">My chores</p>
            <h2>{visible.length ? `${visible.length} thing${visible.length === 1 ? "" : "s"} on your board` : "You are clear for now"}</h2>
            <p>Tap complete when the work is done. Skip only when it truly stands down.</p>
          </div>
          <label className="inline-select">
            Person
            <select value={selected?.id || ""} onChange={(event) => setActiveMember(event.target.value)}>
              {selectable.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      {!selected ? (
        <EmptyState title="No family members yet" action={<CheckCircle2 size={24} />}>
          Add family members first, then Kid Mode can show each person's work.
        </EmptyState>
      ) : visible.length ? (
        <section className="kid-tile-grid">
          {visible.map((chore) => (
            <ChoreActionCard key={chore.id} chore={chore} data={data} actorMemberId={selected.id} onComplete={completeChore} onSkip={skipChore} />
          ))}
        </section>
      ) : (
        <EmptyState title="Nothing on your board" action={<CheckCircle2 size={24} />}>
          The chore board is quiet for this person.
        </EmptyState>
      )}
    </div>
  );
}
