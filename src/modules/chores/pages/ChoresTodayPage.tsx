import { ArrowLeft, Coffee, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { ChoreActionCard } from "../components/ChoreActionCard";
import { getTodayChores } from "../choreUtils";
import type { ChoreDayBlock } from "../types";
import { useChores } from "../useChores";

const blocks: ChoreDayBlock[] = ["AM", "PM", "Anytime"];

export function ChoresTodayPage() {
  const { data, activeMember, setActiveMember, completeChore, skipChore } = useChores();
  const today = getTodayChores(data);
  const membersWithChores = data.members
    .map((member) => ({ member, chores: today.filter((chore) => chore.ownerMemberId === member.id) }))
    .filter((entry) => entry.chores.length);
  const unowned = today.filter((chore) => !data.members.some((member) => member.id === chore.ownerMemberId));

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Today"
        title={today.length ? "Two things, then coffee" : "Today stands down"}
        actions={
          <>
            <LinkButton to="/chores" variant="secondary">
              <ArrowLeft size={18} />
              Overview
            </LinkButton>
            <LinkButton to="/chores/new">
              <Plus size={18} />
              Add chore
            </LinkButton>
          </>
        }
      >
        <p>Grouped by owner, with AM and PM blocks when they help. Completing is trust-based; skipping asks for one plain reason.</p>
      </PageHeader>

      <section className="focus-band">
        <div>
          <p className="eyebrow">Active hand</p>
          <h2>{activeMember?.name || "Choose a family member"}</h2>
          <p>Completions are attributed to the selected person. No approval queue, no proof gate.</p>
        </div>
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
      </section>

      {today.length === 0 ? (
        <EmptyState title="Nothing needs doing today" action={<Coffee size={24} />}>
          Fixed chores are done or not scheduled, decay chores are not ripe, conditions stand down, and seasonal work is still waiting its window.
        </EmptyState>
      ) : (
        <section className="today-board">
          {membersWithChores.map((entry) => (
            <article className="today-person" key={entry.member.id}>
              <div className="section-heading">
                <p className="eyebrow">{entry.member.initials}</p>
                <h2>{entry.member.name}</h2>
              </div>
              {blocks.map((block) => {
                const chores = entry.chores.filter((chore) => chore.recurrenceParams.block === block);
                return chores.length ? (
                  <div className="today-block" key={block}>
                    <h3>{block}</h3>
                    <div className="compact-list">
                      {chores.map((chore) => (
                        <ChoreActionCard key={chore.id} chore={chore} data={data} actorMemberId={activeMember?.id || entry.member.id} onComplete={completeChore} onSkip={skipChore} />
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </article>
          ))}
          {unowned.length ? (
            <article className="today-person">
              <div className="section-heading">
                <p className="eyebrow">Needs owner</p>
                <h2>Bring to the Huddle</h2>
              </div>
              <div className="compact-list">
                {unowned.map((chore) => (
                  <ChoreActionCard key={chore.id} chore={chore} data={data} actorMemberId={activeMember?.id} onComplete={completeChore} onSkip={skipChore} />
                ))}
              </div>
            </article>
          ) : null}
        </section>
      )}
    </div>
  );
}
