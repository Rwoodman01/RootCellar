import { ArrowLeft, ArrowRight, Check, CircleSlash, CornerUpRight, HandHeart, Plus } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { useAnimals } from "../../animals/useAnimals";
import { useChores } from "../../chores/useChores";
import { useGarden } from "../../garden/useGarden";
import { usePantry } from "../../pantry/usePantry";
import { usePreservationPlans } from "../../preservation/usePreservationPlans";
import { addDays, getPulseSnapshots, getWeekRange, getWeeklySignals, todayDate, type PulseSnapshot, type WeeklySignal } from "../rhythmUtils";
import type {
  HuddleModuleSource,
  OwnedWorkItem,
  PriorityLinkedModule,
  PulseMetricStatus,
  SeasonPriority,
  SeasonPriorityStatus,
  StuckItem,
} from "../types";
import { useHuddle } from "../useHuddle";

const priorityStatuses: SeasonPriorityStatus[] = ["on_track", "off_track", "done", "paused"];
const priorityModules: PriorityLinkedModule[] = ["manual", "preservation", "pantry", "garden", "animals", "chores"];
const pulseStatuses: PulseMetricStatus[] = ["good", "watch", "needs_attention"];
const stepLabels = ["Check in", "Pulse", "What slipped", "Who owns what", "Next week"];

export function WeeklyHuddlePage() {
  const huddle = useHuddle();
  const { data: chores } = useChores();
  const { data: pantry } = usePantry();
  const { data: animals } = useAnimals();
  const { data: garden } = useGarden();
  const { plans } = usePreservationPlans();
  const { weekStart, weekEnd } = getWeekRange(todayDate());
  const entry = huddle.data.weeklyHuddleEntries.find((item) => item.weekStart === weekStart);

  const [step, setStep] = useState(() => {
    const flags = [entry?.pulseReviewed, entry?.stuckListReviewed, entry?.ownedWorkReviewed, entry?.prioritiesReviewed];
    const firstUnreviewed = flags.findIndex((flag) => !flag);
    return firstUnreviewed === -1 ? 0 : firstUnreviewed + 1;
  });

  const [notesForm, setNotesForm] = useState({
    wins: entry?.wins.join("\n") || "",
    decisions: entry?.decisions.join("\n") || "",
    nextWeekFocus: entry?.nextWeekFocus.join("\n") || "",
  });
  const [priorityForm, setPriorityForm] = useState({ title: "", ownerMemberId: "", targetDate: "", linkedModule: "manual" as PriorityLinkedModule });
  const [workForm, setWorkForm] = useState({ title: "", ownerMemberId: "", dueDate: addDays(weekEnd, 1) });
  const [stuckForm, setStuckForm] = useState({ title: "", details: "", ownerMemberId: "" });
  const [pulseForm, setPulseForm] = useState({ title: "", value: "", target: "", unit: "", status: "watch" as PulseMetricStatus });

  const source = useMemo(
    () => ({ huddle: huddle.data, chores, pantry, animals, garden, preservationPlans: plans }),
    [animals, chores, garden, huddle.data, pantry, plans],
  );
  const pulse = useMemo(() => getPulseSnapshots(source, weekStart), [source, weekStart]);
  const signals = useMemo(() => getWeeklySignals(source), [source]);
  const openWork = huddle.data.ownedWorkItems.filter((item) => item.status === "open" || item.status === "carried");
  const openStuck = huddle.data.stuckItems.filter((item) => item.status === "open" || item.status === "carried");
  const lastWeekEntries = huddle.data.dailyBreadEntries.filter((item) => item.date >= weekStart && item.date <= weekEnd && (item.todayFocus || item.gratitude));

  function commitNotes(next: Partial<typeof notesForm> = {}) {
    const merged = { ...notesForm, ...next };
    huddle.updateWeeklyHuddle(weekStart, weekEnd, {
      wins: lines(merged.wins),
      decisions: lines(merged.decisions),
      nextWeekFocus: lines(merged.nextWeekFocus),
    });
  }

  function addPriority(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!priorityForm.title.trim()) return;
    huddle.addSeasonPriority({
      title: priorityForm.title,
      ownerMemberId: priorityForm.ownerMemberId || undefined,
      status: "on_track",
      targetDate: priorityForm.targetDate || undefined,
      notes: "",
      linkedModule: priorityForm.linkedModule,
    });
    setPriorityForm({ title: "", ownerMemberId: "", targetDate: "", linkedModule: "manual" });
  }

  function addWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workForm.title.trim()) return;
    huddle.addOwnedWorkItem({
      title: workForm.title,
      ownerMemberId: workForm.ownerMemberId || undefined,
      dueDate: workForm.dueDate || undefined,
      sourceType: "weekly_huddle",
      status: "open",
      notes: "",
    });
    setWorkForm({ title: "", ownerMemberId: "", dueDate: addDays(weekEnd, 1) });
  }

  function addStuck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stuckForm.title.trim()) return;
    huddle.addStuckItem({
      title: stuckForm.title,
      details: stuckForm.details,
      ownerMemberId: stuckForm.ownerMemberId || undefined,
      sourceType: "manual",
      status: "open",
      decision: "",
    });
    setStuckForm({ title: "", details: "", ownerMemberId: "" });
  }

  function addPulse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pulseForm.title.trim()) return;
    huddle.addPulseMetric({
      title: pulseForm.title,
      value: pulseForm.value,
      target: pulseForm.target,
      unit: pulseForm.unit,
      status: pulseForm.status,
      sourceType: "manual",
      weekStart,
      notes: "",
    });
    setPulseForm({ title: "", value: "", target: "", unit: "", status: "watch" });
  }

  function updateReviewFlag(flag: "pulseReviewed" | "prioritiesReviewed" | "ownedWorkReviewed" | "stuckListReviewed", value: boolean) {
    huddle.updateWeeklyHuddle(weekStart, weekEnd, { [flag]: value });
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Weekly Huddle"
        title={stepLabels[step]}
        actions={
          <>
            <LinkButton to="/daily-bread" variant="secondary">
              <HandHeart size={18} />
              Daily Bread
            </LinkButton>
            <Button type="button" onClick={() => huddle.completeWeeklyHuddle(weekStart, weekEnd)} variant={entry?.completedAt ? "secondary" : "primary"}>
              <Check size={18} />
              {entry?.completedAt ? "Completed" : "Close huddle"}
            </Button>
          </>
        }
      >
        <p>
          {formatShortDate(weekStart)} to {formatShortDate(weekEnd)} · around the table
        </p>
      </PageHeader>

      <nav className="huddle-steps" aria-label="Huddle steps">
        {stepLabels.map((label, index) => (
          <button key={label} type="button" className={index === step ? "active" : undefined} onClick={() => setStep(index)}>
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </nav>

      {step === 0 ? (
        <section className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Last week</p>
            <h2>What worked?</h2>
          </div>
          <div className="compact-list">
            {lastWeekEntries.length ? (
              lastWeekEntries.map((item) => (
                <div className="compact-row" key={item.id}>
                  <strong>{formatShortDate(item.date)}</strong>
                  <span>{item.todayFocus || "No focus set"}</span>
                  {item.gratitude ? <small>{item.gratitude}</small> : null}
                </div>
              ))
            ) : (
              <p className="muted">No daily notes were left this week.</p>
            )}
          </div>
          <label>
            Wins
            <textarea
              rows={3}
              value={notesForm.wins}
              onChange={(event) => setNotesForm((current) => ({ ...current, wins: event.target.value }))}
              onBlur={() => commitNotes()}
              placeholder="What went right this week?"
            />
          </label>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="pantry-panel">
          <ReviewHeader eyebrow="Pulse" title="How the household is running" checked={Boolean(entry?.pulseReviewed)} onChange={(value) => updateReviewFlag("pulseReviewed", value)} />
          <div className="rhythm-metric-grid">
            {pulse.map((metric) => (
              <PulseCard metric={metric} key={metric.id} />
            ))}
          </div>
          <details className="rhythm-disclosure">
            <summary>+ Add a household number</summary>
            <form className="rhythm-inline-form" onSubmit={addPulse}>
              <label>
                Title
                <input value={pulseForm.title} onChange={(event) => setPulseForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <div className="form-grid">
                <label>
                  Value
                  <input value={pulseForm.value} onChange={(event) => setPulseForm((current) => ({ ...current, value: event.target.value }))} />
                </label>
                <label>
                  Target
                  <input value={pulseForm.target} onChange={(event) => setPulseForm((current) => ({ ...current, target: event.target.value }))} />
                </label>
                <label>
                  Unit
                  <input value={pulseForm.unit} onChange={(event) => setPulseForm((current) => ({ ...current, unit: event.target.value }))} />
                </label>
                <label>
                  Status
                  <select value={pulseForm.status} onChange={(event) => setPulseForm((current) => ({ ...current, status: event.target.value as PulseMetricStatus }))}>
                    {pulseStatuses.map((status) => (
                      <option value={status} key={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Button type="submit">
                <Plus size={18} />
                Add pulse
              </Button>
            </form>
          </details>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="pantry-panel">
          <ReviewHeader eyebrow="What slipped" title="Name it, sort it, decide" checked={Boolean(entry?.stuckListReviewed)} onChange={(value) => updateReviewFlag("stuckListReviewed", value)} />
          {signals.length ? (
            <div className="compact-list">
              {signals.map((signal) => (
                <SignalRow
                  key={signal.id}
                  signal={signal}
                  onCarry={() =>
                    huddle.addStuckItem({
                      title: signal.title,
                      details: signal.detail,
                      sourceType: stuckSourceFromModule(signal.sourceType),
                      sourceId: signal.id,
                      status: "open",
                      decision: "",
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No slipping signals" action={<Check size={24} />}>
              The connected rooms are quiet for this week.
            </EmptyState>
          )}

          <div className="section-heading">
            <p className="eyebrow">Stuck list</p>
            <h2>Decided or still open</h2>
          </div>
          <form className="rhythm-inline-form" onSubmit={addStuck}>
            <div className="form-grid">
              <label>
                Stuck item
                <input value={stuckForm.title} onChange={(event) => setStuckForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label>
                Owner
                <select value={stuckForm.ownerMemberId} onChange={(event) => setStuckForm((current) => ({ ...current, ownerMemberId: event.target.value }))}>
                  <option value="">Household</option>
                  {chores.members.map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Details
              <textarea rows={2} value={stuckForm.details} onChange={(event) => setStuckForm((current) => ({ ...current, details: event.target.value }))} />
            </label>
            <Button type="submit">
              <Plus size={18} />
              Add stuck item
            </Button>
          </form>
          <div className="compact-list">
            {openStuck.length ? (
              openStuck.map((item) => (
                <StuckRow key={item.id} item={item} members={chores.members} onStatus={(status) => huddle.updateStuckItem(item.id, { ...item, status })} />
              ))
            ) : (
              <p className="muted">Nothing is on the stuck list.</p>
            )}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="pantry-panel">
          <ReviewHeader eyebrow="Owned work" title="Who owns what next" checked={Boolean(entry?.ownedWorkReviewed)} onChange={(value) => updateReviewFlag("ownedWorkReviewed", value)} />
          <form className="rhythm-inline-form" onSubmit={addWork}>
            <div className="form-grid">
              <label>
                Work
                <input value={workForm.title} onChange={(event) => setWorkForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label>
                Owner
                <select value={workForm.ownerMemberId} onChange={(event) => setWorkForm((current) => ({ ...current, ownerMemberId: event.target.value }))}>
                  <option value="">Household</option>
                  {chores.members.map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due
                <input type="date" value={workForm.dueDate} onChange={(event) => setWorkForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </label>
            </div>
            <Button type="submit">
              <Plus size={18} />
              Add work
            </Button>
          </form>
          <div className="compact-list">
            {openWork.length ? (
              openWork.map((item) => (
                <OwnedWorkRow
                  key={item.id}
                  item={item}
                  members={chores.members}
                  onDone={() => huddle.updateOwnedWorkStatus(item.id, "done")}
                  onCarry={() =>
                    huddle.updateOwnedWorkItem(item.id, {
                      ...item,
                      status: "carried",
                      dueDate: item.dueDate || addDays(weekEnd, 1),
                    })
                  }
                  onDrop={() => huddle.updateOwnedWorkStatus(item.id, "dropped")}
                />
              ))
            ) : (
              <p className="muted">No open owned work.</p>
            )}
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="pantry-panel">
          <ReviewHeader eyebrow="Season priorities" title="Big rocks for next week" checked={Boolean(entry?.prioritiesReviewed)} onChange={(value) => updateReviewFlag("prioritiesReviewed", value)} />
          <form className="rhythm-inline-form" onSubmit={addPriority}>
            <div className="form-grid">
              <label>
                Priority
                <input value={priorityForm.title} onChange={(event) => setPriorityForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label>
                Owner
                <select value={priorityForm.ownerMemberId} onChange={(event) => setPriorityForm((current) => ({ ...current, ownerMemberId: event.target.value }))}>
                  <option value="">Household</option>
                  {chores.members.map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Linked room
                <select value={priorityForm.linkedModule} onChange={(event) => setPriorityForm((current) => ({ ...current, linkedModule: event.target.value as PriorityLinkedModule }))}>
                  {priorityModules.map((module) => (
                    <option value={module} key={module}>
                      {moduleLabel(module)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Target date
                <input type="date" value={priorityForm.targetDate} onChange={(event) => setPriorityForm((current) => ({ ...current, targetDate: event.target.value }))} />
              </label>
            </div>
            <Button type="submit">
              <Plus size={18} />
              Add priority
            </Button>
          </form>
          <div className="compact-list">
            {huddle.data.seasonPriorities.length ? (
              huddle.data.seasonPriorities.map((priority) => (
                <PriorityRow key={priority.id} priority={priority} members={chores.members} onUpdate={(next) => huddle.updateSeasonPriority(priority.id, next)} />
              ))
            ) : (
              <p className="muted">No season priorities yet.</p>
            )}
          </div>

          <label>
            Decisions made today
            <textarea
              rows={3}
              value={notesForm.decisions}
              onChange={(event) => setNotesForm((current) => ({ ...current, decisions: event.target.value }))}
              onBlur={() => commitNotes()}
            />
          </label>
          <label>
            Household focus for next week
            <textarea
              rows={2}
              value={notesForm.nextWeekFocus}
              onChange={(event) => setNotesForm((current) => ({ ...current, nextWeekFocus: event.target.value }))}
              onBlur={() => commitNotes()}
            />
          </label>
        </section>
      ) : null}

      <div className="huddle-step-nav">
        <Button type="button" variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
          <ArrowLeft size={18} />
          Back
        </Button>
        {step < stepLabels.length - 1 ? (
          <Button type="button" onClick={() => setStep((current) => Math.min(stepLabels.length - 1, current + 1))}>
            Next
            <ArrowRight size={18} />
          </Button>
        ) : (
          <Button type="button" onClick={() => huddle.completeWeeklyHuddle(weekStart, weekEnd)}>
            <Check size={18} />
            Close huddle
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewHeader({ eyebrow, title, checked, onChange }: { eyebrow: string; title: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="section-heading section-heading-row rhythm-review-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <label className="checkbox-row rhythm-review-check">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        Reviewed
      </label>
    </div>
  );
}

function PulseCard({ metric }: { metric: PulseSnapshot }) {
  return (
    <article className={`rhythm-metric rhythm-status-${metric.status}`}>
      <span>{moduleLabel(metric.sourceType)}</span>
      <strong>
        {metric.value}
        {metric.unit ? <small> {metric.unit}</small> : null}
      </strong>
      <h3>{metric.title}</h3>
      {metric.target ? <p>Target: {metric.target}</p> : null}
      {metric.notes ? <p>{metric.notes}</p> : null}
    </article>
  );
}

function PriorityRow({
  priority,
  members,
  onUpdate,
}: {
  priority: SeasonPriority;
  members: Array<{ id: string; name: string }>;
  onUpdate: (priority: Omit<SeasonPriority, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const owner = members.find((member) => member.id === priority.ownerMemberId)?.name || "Household";
  return (
    <article className={`rhythm-item rhythm-priority-${priority.status}`}>
      <div>
        <strong>{priority.title}</strong>
        <span>
          {owner} · {moduleLabel(priority.linkedModule || "manual")}
        </span>
        {priority.targetDate ? <small>{formatShortDate(priority.targetDate)}</small> : null}
      </div>
      <select value={priority.status} onChange={(event) => onUpdate({ ...priority, status: event.target.value as SeasonPriorityStatus })} aria-label="Priority status">
        {priorityStatuses.map((status) => (
          <option value={status} key={status}>
            {priorityStatusLabel(status)}
          </option>
        ))}
      </select>
    </article>
  );
}

function OwnedWorkRow({
  item,
  members,
  onDone,
  onCarry,
  onDrop,
}: {
  item: OwnedWorkItem;
  members: Array<{ id: string; name: string }>;
  onDone: () => void;
  onCarry: () => void;
  onDrop: () => void;
}) {
  const owner = members.find((member) => member.id === item.ownerMemberId)?.name || "Household";
  return (
    <article className={`rhythm-item rhythm-work-${item.status}`}>
      <div>
        <strong>{item.title}</strong>
        <span>{owner}</span>
        {item.dueDate ? <small>{formatShortDate(item.dueDate)}</small> : null}
      </div>
      <div className="rhythm-item-actions">
        <Button className="icon-button" type="button" variant="secondary" onClick={onDone} title="Done">
          <Check size={17} />
        </Button>
        <Button className="icon-button" type="button" variant="secondary" onClick={onCarry} title="Carry">
          <CornerUpRight size={17} />
        </Button>
        <Button className="icon-button" type="button" variant="secondary" onClick={onDrop} title="Drop">
          <CircleSlash size={17} />
        </Button>
      </div>
    </article>
  );
}

function StuckRow({
  item,
  members,
  onStatus,
}: {
  item: StuckItem;
  members: Array<{ id: string; name: string }>;
  onStatus: (status: StuckItem["status"]) => void;
}) {
  const owner = members.find((member) => member.id === item.ownerMemberId)?.name || "Household";
  return (
    <article className={`rhythm-item rhythm-stuck-${item.status}`}>
      <div>
        <strong>{item.title}</strong>
        <span>{owner}</span>
        {item.details ? <small>{item.details}</small> : null}
      </div>
      <select value={item.status} onChange={(event) => onStatus(event.target.value as StuckItem["status"])} aria-label="Stuck item status">
        <option value="open">Open</option>
        <option value="solved">Solved</option>
        <option value="carried">Carried</option>
        <option value="dropped">Dropped</option>
      </select>
    </article>
  );
}

function SignalRow({ signal, onCarry }: { signal: WeeklySignal; onCarry: () => void }) {
  const content = (
    <>
      <strong>{signal.title}</strong>
      <span>
        {moduleLabel(signal.sourceType)} · {signal.detail}
      </span>
    </>
  );
  return (
    <article className={`rhythm-item rhythm-signal rhythm-status-${signal.status}`}>
      {signal.href ? (
        <Link to={signal.href} className="rhythm-item-link">
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
      <Button className="icon-button" type="button" variant="secondary" onClick={onCarry} title="Add to stuck list">
        <Plus size={17} />
      </Button>
    </article>
  );
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function statusLabel(status: PulseMetricStatus): string {
  if (status === "needs_attention") return "Needs attention";
  if (status === "watch") return "Watch";
  return "Good";
}

function priorityStatusLabel(status: SeasonPriorityStatus): string {
  if (status === "on_track") return "On track";
  if (status === "off_track") return "Off track";
  if (status === "paused") return "Paused";
  return "Done";
}

function moduleLabel(module: HuddleModuleSource | PriorityLinkedModule | "daily_bread" | "weekly_huddle"): string {
  if (module === "daily_bread") return "Daily Bread";
  if (module === "weekly_huddle") return "Weekly Huddle";
  return module.charAt(0).toUpperCase() + module.slice(1).replace("_", " ");
}

function stuckSourceFromModule(module: HuddleModuleSource): StuckItem["sourceType"] {
  if (module === "chores") return "chores";
  if (module === "animals") return "animals";
  if (module === "garden") return "garden";
  if (module === "pantry") return "pantry";
  if (module === "preservation") return "preservation";
  return "manual";
}
