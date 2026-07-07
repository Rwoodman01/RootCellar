import { ArrowLeft, ArrowRight, CalendarDays, Check, CircleSlash, CornerUpRight, HandHeart, Plus } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { Stepper } from "../../../shared/components/Stepper";
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
  WeeklyHuddleEntry,
} from "../types";
import { useHuddle } from "../useHuddle";

const priorityStatuses: SeasonPriorityStatus[] = ["on_track", "off_track", "done", "paused"];
const priorityModules: PriorityLinkedModule[] = ["manual", "preservation", "pantry", "garden", "animals", "chores"];
const pulseStatuses: PulseMetricStatus[] = ["good", "watch", "needs_attention"];

export function WeeklyHuddlePage() {
  const huddle = useHuddle();
  const { data: chores } = useChores();
  const { data: pantry } = usePantry();
  const { data: animals } = useAnimals();
  const { data: garden } = useGarden();
  const { plans } = usePreservationPlans();
  const { weekStart, weekEnd } = getWeekRange(todayDate());
  const entry = huddle.data.weeklyHuddleEntries.find((item) => item.weekStart === weekStart);
  const [notesForm, setNotesForm] = useState({
    wins: entry?.wins.join("\n") || "",
    pulseNotes: entry?.pulseNotes || "",
    priorityNotes: entry?.priorityNotes || "",
    stuckItems: entry?.stuckItems.join("\n") || "",
    decisions: entry?.decisions.join("\n") || "",
    nextWeekFocus: entry?.nextWeekFocus.join("\n") || "",
    carryForwardItems: entry?.carryForwardItems.join("\n") || "",
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
  const activePriorities = huddle.data.seasonPriorities.filter((priority) => priority.status !== "done");
  const pulseNeedsAttention = pulse.filter((metric) => metric.status === "needs_attention").length;

  useEffect(() => {
    setNotesForm({
      wins: entry?.wins.join("\n") || "",
      pulseNotes: entry?.pulseNotes || "",
      priorityNotes: entry?.priorityNotes || "",
      stuckItems: entry?.stuckItems.join("\n") || "",
      decisions: entry?.decisions.join("\n") || "",
      nextWeekFocus: entry?.nextWeekFocus.join("\n") || "",
      carryForwardItems: entry?.carryForwardItems.join("\n") || "",
    });
  }, [entry?.weekStart, entry?.wins, entry?.pulseNotes, entry?.priorityNotes, entry?.stuckItems, entry?.decisions, entry?.nextWeekFocus, entry?.carryForwardItems]);

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

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(() => firstOpenStep(entry));
  const stepDone = [
    Boolean(entry?.pulseReviewed),
    Boolean(entry?.prioritiesReviewed),
    Boolean(entry?.ownedWorkReviewed),
    Boolean(entry?.stuckListReviewed),
    Boolean(entry?.completedAt),
  ];

  function goToStep(nextStep: number) {
    setStep(nextStep as 1 | 2 | 3 | 4 | 5);
  }

  function advance(patch: Parameters<typeof huddle.updateWeeklyHuddle>[2], nextStep: 1 | 2 | 3 | 4 | 5) {
    huddle.updateWeeklyHuddle(weekStart, weekEnd, patch);
    setStep(nextStep);
  }

  function closeHuddle() {
    huddle.updateWeeklyHuddle(weekStart, weekEnd, {
      wins: lines(notesForm.wins),
      decisions: lines(notesForm.decisions),
      nextWeekFocus: lines(notesForm.nextWeekFocus),
      carryForwardItems: lines(notesForm.carryForwardItems),
    });
    huddle.completeWeeklyHuddle(weekStart, weekEnd);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Weekly Huddle"
        title="What worked, what slipped, and what needs carrying next?"
        actions={
          <LinkButton to="/daily-bread" variant="secondary">
            <HandHeart size={18} />
            Daily Bread
          </LinkButton>
        }
      >
        <p>Around the table: what worked, what slipped, and what needs carrying next.</p>
      </PageHeader>

      <section className="focus-band rhythm-focus">
        <div>
          <p className="eyebrow">
            {formatShortDate(weekStart)} to {formatShortDate(weekEnd)}
          </p>
          <h2>{signals.length ? `${signals.length} thing${signals.length === 1 ? "" : "s"} need a look` : "The week is steady"}</h2>
          <p>
            {activePriorities.length} season priorit{activePriorities.length === 1 ? "y" : "ies"} · {openWork.length} open work · {openStuck.length} stuck
          </p>
        </div>
        <CalendarDays size={28} />
      </section>

      <section className="summary-strip" aria-label="Weekly Huddle summary">
        <div>
          <span>Pulse</span>
          <strong>{pulseNeedsAttention}</strong>
          <small>Need attention</small>
        </div>
        <div>
          <span>Big rocks</span>
          <strong>{activePriorities.length}</strong>
          <small>Active priorities</small>
        </div>
        <div>
          <span>Owned work</span>
          <strong>{openWork.length}</strong>
          <small>Open or carried</small>
        </div>
        <div>
          <span>Stuck list</span>
          <strong>{openStuck.length}</strong>
          <small>Needs attention</small>
        </div>
      </section>

      <Stepper steps={["Pulse", "Priorities", "Owned work", "Stuck list", "Close"]} current={step} done={stepDone} onSelect={goToStep} />

      {step === 1 ? (
        <section className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Pulse</p>
            <h2>How the household is running</h2>
          </div>
          <div className="rhythm-metric-grid">
            {pulse.map((metric) => (
              <PulseCard metric={metric} key={metric.id} />
            ))}
          </div>
          <label>
            Pulse notes
            <textarea rows={3} value={notesForm.pulseNotes} onChange={(event) => setNotesForm((current) => ({ ...current, pulseNotes: event.target.value }))} />
          </label>
          <form className="rhythm-inline-form" onSubmit={addPulse}>
            <div className="section-heading">
              <p className="eyebrow">Manual pulse</p>
              <h2>Add a household number</h2>
            </div>
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
          <div className="onboarding-actions">
            <Button type="button" onClick={() => advance({ pulseReviewed: true, pulseNotes: notesForm.pulseNotes }, 2)}>
              Next: Priorities
              <ArrowRight size={18} />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Season priorities</p>
            <h2>Big rocks</h2>
          </div>
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
            Priority notes
            <textarea rows={3} value={notesForm.priorityNotes} onChange={(event) => setNotesForm((current) => ({ ...current, priorityNotes: event.target.value }))} />
          </label>
          <div className="onboarding-actions">
            <Button type="button" variant="secondary" onClick={() => goToStep(1)}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button type="button" onClick={() => advance({ prioritiesReviewed: true, priorityNotes: notesForm.priorityNotes }, 3)}>
              Next: Owned work
              <ArrowRight size={18} />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Owned work</p>
            <h2>Who owns what next</h2>
          </div>
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
          <div className="onboarding-actions">
            <Button type="button" variant="secondary" onClick={() => goToStep(2)}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button type="button" onClick={() => advance({ ownedWorkReviewed: true }, 4)}>
              Next: Stuck list
              <ArrowRight size={18} />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <>
          <section className="pantry-panel">
            <div className="section-heading">
              <p className="eyebrow">Needs attention</p>
              <h2>Name what is stuck</h2>
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
                  <StuckRow
                    key={item.id}
                    item={item}
                    members={chores.members}
                    onStatus={(status) => huddle.updateStuckItem(item.id, { ...item, status })}
                  />
                ))
              ) : (
                <p className="muted">Nothing is on the stuck list.</p>
              )}
            </div>
            <label>
              Stuck list notes
              <textarea rows={3} value={notesForm.stuckItems} onChange={(event) => setNotesForm((current) => ({ ...current, stuckItems: event.target.value }))} />
            </label>
          </section>

          <section className="pantry-panel">
            <div className="section-heading">
              <p className="eyebrow">Module signals</p>
              <h2>What slipped or needs a look</h2>
            </div>
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
          </section>

          <div className="onboarding-actions">
            <Button type="button" variant="secondary" onClick={() => goToStep(3)}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button type="button" onClick={() => advance({ stuckListReviewed: true, stuckItems: lines(notesForm.stuckItems) }, 5)}>
              Next: Close
              <ArrowRight size={18} />
            </Button>
          </div>
        </>
      ) : null}

      {step === 5 ? (
        <section className="form-panel rhythm-notes-panel">
          <div className="section-heading">
            <p className="eyebrow">Around the table</p>
            <h2>Notes and decisions</h2>
          </div>
          <label>
            Wins
            <textarea rows={3} value={notesForm.wins} onChange={(event) => setNotesForm((current) => ({ ...current, wins: event.target.value }))} />
          </label>
          <label>
            Decisions
            <textarea rows={3} value={notesForm.decisions} onChange={(event) => setNotesForm((current) => ({ ...current, decisions: event.target.value }))} />
          </label>
          <label>
            Next week focus
            <textarea rows={3} value={notesForm.nextWeekFocus} onChange={(event) => setNotesForm((current) => ({ ...current, nextWeekFocus: event.target.value }))} />
          </label>
          <label>
            Carries into next week
            <textarea rows={3} value={notesForm.carryForwardItems} onChange={(event) => setNotesForm((current) => ({ ...current, carryForwardItems: event.target.value }))} />
          </label>
          <div className="onboarding-actions">
            <Button type="button" variant="secondary" onClick={() => goToStep(4)}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button type="button" onClick={closeHuddle} variant={entry?.completedAt ? "secondary" : "primary"}>
              <Check size={18} />
              {entry?.completedAt ? "Completed" : "Close huddle"}
            </Button>
          </div>
        </section>
      ) : null}
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

function firstOpenStep(entry?: WeeklyHuddleEntry): 1 | 2 | 3 | 4 | 5 {
  if (!entry || !entry.pulseReviewed) return 1;
  if (!entry.prioritiesReviewed) return 2;
  if (!entry.ownedWorkReviewed) return 3;
  if (!entry.stuckListReviewed) return 4;
  return 5;
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
