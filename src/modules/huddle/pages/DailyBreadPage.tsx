import { Check, CircleSlash, CornerUpRight, HandHeart, Plus, Wheat } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { OnboardingResumeBanner } from "../../../onboarding/OnboardingResumeBanner";
import { confirmAndLoadSampleHomestead } from "../../../shared/storage/sampleHomestead";
import { dueCareReminders } from "../../animals/animalUtils";
import { useAnimals } from "../../animals/useAnimals";
import { useChores } from "../../chores/useChores";
import { useGarden } from "../../garden/useGarden";
import { getUseSoonBatches } from "../../pantry/pantryUtils";
import { usePantry } from "../../pantry/usePantry";
import { usePreservationPlans } from "../../preservation/usePreservationPlans";
import { addDays, getDailyBreadItems, mergeDailyBreadStatuses, todayDate, type DailyBreadSourceItem } from "../rhythmUtils";
import type { DailyBreadItemStatus, OwnedWorkSourceType } from "../types";
import { useHuddle } from "../useHuddle";

const groupLabels: Record<DailyBreadSourceItem["group"], string> = {
  owned: "Owned work",
  chores: "Chores",
  animals: "Animals",
  garden: "Garden",
  pantry: "Pantry",
  preservation: "Preservation",
  carry: "Carry-forward",
};

export function DailyBreadPage() {
  const today = todayDate();
  const huddle = useHuddle();
  const { plans } = usePreservationPlans();
  const { data: pantry } = usePantry();
  const { data: animals } = useAnimals();
  const { data: garden } = useGarden();
  const { data: chores, activeMember, completeChore, skipChore } = useChores();
  const entry = huddle.data.dailyBreadEntries.find((item) => item.date === today);
  const [noteForm, setNoteForm] = useState({
    todayFocus: entry?.todayFocus || "",
    householdNote: entry?.householdNote || "",
    gratitude: entry?.gratitude || "",
    prayerOrReflection: entry?.prayerOrReflection || "",
  });
  const [newWorkTitle, setNewWorkTitle] = useState("");
  const [newWorkOwner, setNewWorkOwner] = useState(activeMember?.id || "");

  useEffect(() => {
    setNoteForm({
      todayFocus: entry?.todayFocus || "",
      householdNote: entry?.householdNote || "",
      gratitude: entry?.gratitude || "",
      prayerOrReflection: entry?.prayerOrReflection || "",
    });
  }, [entry?.date, entry?.todayFocus, entry?.householdNote, entry?.gratitude, entry?.prayerOrReflection]);

  useEffect(() => {
    if (!newWorkOwner && activeMember?.id) setNewWorkOwner(activeMember.id);
  }, [activeMember?.id, newWorkOwner]);

  const dailyItems = useMemo(
    () =>
      mergeDailyBreadStatuses(
        getDailyBreadItems(
          {
            huddle: huddle.data,
            chores,
            animals,
            garden,
            pantry,
            preservationPlans: plans,
          },
          today,
        ),
        entry?.selectedItems,
      ),
    [animals, chores, entry?.selectedItems, garden, huddle.data, pantry, plans, today],
  );

  const doneCount = dailyItems.filter((item) => item.status === "done").length;
  const carriedCount = dailyItems.filter((item) => item.status === "carried").length;
  const animalCareCount = dueCareReminders(animals.careReminders, today).length;
  const useSoonCount = getUseSoonBatches(pantry, 14).length;
  const hasAnyData = Boolean(
    chores.members.length || chores.chores.length || pantry.products.length || garden.beds.length || animals.groups.length || plans.length,
  );

  function saveNotes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    huddle.updateDailyBreadNotes(today, noteForm);
  }

  function addOwnedWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newWorkTitle.trim();
    if (!title) return;
    huddle.addOwnedWorkItem({
      title,
      ownerMemberId: newWorkOwner || undefined,
      dueDate: today,
      sourceType: "daily_bread",
      status: "open",
      notes: "",
    });
    setNewWorkTitle("");
  }

  function setItemStatus(item: DailyBreadSourceItem, status: DailyBreadItemStatus) {
    if (item.sourceType === "chore" && item.sourceId) {
      if (status === "done") completeChore(item.sourceId, activeMember?.id || item.ownerMemberId);
      if (status === "skipped") skipChore(item.sourceId, "other", activeMember?.id || item.ownerMemberId);
    }

    if (item.sourceType === "owned_work" && item.sourceId) {
      if (status === "done") huddle.updateOwnedWorkStatus(item.sourceId, "done");
      if (status === "carried") huddle.updateOwnedWorkStatus(item.sourceId, "carried");
    }

    if (status === "carried" && item.sourceType !== "owned_work") {
      const alreadyCarried = huddle.data.ownedWorkItems.some((work) => work.sourceId === item.sourceId && work.title === item.title && work.status !== "done");
      if (!alreadyCarried) {
        huddle.addOwnedWorkItem({
          title: item.title,
          ownerMemberId: item.ownerMemberId,
          dueDate: addDays(today, 1),
          sourceType: ownedWorkSourceFromDaily(item.sourceType),
          sourceId: item.sourceId,
          status: "carried",
          notes: item.detail,
        });
      }
    }

    huddle.setDailyBreadItemStatus(today, item, status);
  }

  return (
    <div className="page-stack">
      <OnboardingResumeBanner />
      <PageHeader
        eyebrow="Daily Bread"
        title="What needs carrying today?"
        actions={
          <>
            <LinkButton to="/huddle" variant="secondary">
              <HandHeart size={18} />
              Weekly Huddle
            </LinkButton>
            <LinkButton to="/chores/today" variant="secondary">
              <Check size={18} />
              Chores
            </LinkButton>
          </>
        }
      >
        <p>Here’s what this household needs to carry today.</p>
      </PageHeader>

      <section className="focus-band rhythm-focus">
        <div>
          <p className="eyebrow">{formatShortDate(today)}</p>
          <h2>{noteForm.todayFocus.trim() || "Choose the day’s focus"}</h2>
          <p>
            {dailyItems.length} open signal{dailyItems.length === 1 ? "" : "s"} · {doneCount} done · {carriedCount} carried
          </p>
        </div>
        <div className="focus-actions">
          <Button type="button" onClick={() => huddle.completeDailyBread(today)} variant={entry?.completedAt ? "secondary" : "primary"}>
            <Wheat size={18} />
            {entry?.completedAt ? "Completed" : "Close today"}
          </Button>
        </div>
      </section>

      <section className="summary-strip" aria-label="Daily Bread summary">
        <div>
          <span>Owned work</span>
          <strong>{huddle.data.ownedWorkItems.filter((item) => item.status === "open" || item.status === "carried").length}</strong>
          <small>Open or carried</small>
        </div>
        <div>
          <span>Chores</span>
          <strong>{dailyItems.filter((item) => item.group === "chores").length}</strong>
          <small>Due today</small>
        </div>
        <div>
          <span>Animal care</span>
          <strong>{animalCareCount}</strong>
          <small>Due reminders</small>
        </div>
        <div>
          <span>Pantry</span>
          <strong>{useSoonCount}</strong>
          <small>Use soon</small>
        </div>
      </section>

      <section className="split-layout">
        <div className="page-stack">
          <form className="form-panel rhythm-inline-form" onSubmit={addOwnedWork}>
            <div className="section-heading">
              <p className="eyebrow">Owned work</p>
              <h2>Add something for today</h2>
            </div>
            <div className="form-grid">
              <label>
                Work
                <input value={newWorkTitle} onChange={(event) => setNewWorkTitle(event.target.value)} placeholder="Call the hay supplier" />
              </label>
              <label>
                Owner
                <select value={newWorkOwner} onChange={(event) => setNewWorkOwner(event.target.value)}>
                  <option value="">Household</option>
                  {chores.members.map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Button type="submit">
              <Plus size={18} />
              Add work
            </Button>
          </form>

          {dailyItems.length === 0 && !hasAnyData ? (
            <EmptyState title="Nothing to carry yet" action={<Wheat size={24} />}>
              Rootcellar hasn't been given anything to remember. Add one real thing to get started.
              <div className="button-row">
                <LinkButton to="/chores/new" variant="secondary">
                  Add a chore
                </LinkButton>
                <LinkButton to="/pantry/products/new" variant="secondary">
                  Add pantry item
                </LinkButton>
                <LinkButton to="/garden/beds" variant="secondary">
                  Add garden bed
                </LinkButton>
                <Button type="button" variant="ghost" onClick={() => confirmAndLoadSampleHomestead()}>
                  Load sample homestead
                </Button>
              </div>
            </EmptyState>
          ) : dailyItems.length === 0 ? (
            <EmptyState title="The day is quiet" action={<Wheat size={24} />}>
              No due chores, care reminders, garden dates, use-soon pantry notes, preservation sessions, or carry-forward work surfaced for today.
            </EmptyState>
          ) : (
            <article className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Today</p>
                <h2>{dailyItems.length} to carry</h2>
              </div>
              <div className="compact-list">
                {dailyItems.map((item) => (
                  <DailyBreadCard key={`${item.sourceType}:${item.sourceId || item.title}`} item={item} onStatus={setItemStatus} />
                ))}
              </div>
            </article>
          )}
        </div>

        <form className="form-panel rhythm-notes-panel" onSubmit={saveNotes}>
          <div className="section-heading">
            <p className="eyebrow">Household note</p>
            <h2>Today’s center</h2>
          </div>
          <label>
            Focus
            <input value={noteForm.todayFocus} onChange={(event) => setNoteForm((current) => ({ ...current, todayFocus: event.target.value }))} />
          </label>
          <label>
            Note
            <textarea rows={3} value={noteForm.householdNote} onChange={(event) => setNoteForm((current) => ({ ...current, householdNote: event.target.value }))} />
          </label>
          <label>
            Gratitude
            <textarea rows={3} value={noteForm.gratitude} onChange={(event) => setNoteForm((current) => ({ ...current, gratitude: event.target.value }))} />
          </label>
          <label>
            Prayer or reflection
            <textarea rows={3} value={noteForm.prayerOrReflection} onChange={(event) => setNoteForm((current) => ({ ...current, prayerOrReflection: event.target.value }))} />
          </label>
          <Button type="submit">
            <Check size={18} />
            Save note
          </Button>
        </form>
      </section>
    </div>
  );
}

function DailyBreadCard({ item, onStatus }: { item: DailyBreadSourceItem; onStatus: (item: DailyBreadSourceItem, status: DailyBreadItemStatus) => void }) {
  return (
    <article className={`rhythm-item rhythm-item-${item.status}`}>
      <div>
        <span className="rhythm-item-tag">{groupLabels[item.group]}</span>
        <strong>{item.title}</strong>
        <span>{item.detail}</span>
        {item.dueDate ? <small>{formatShortDate(item.dueDate)}</small> : null}
      </div>
      <div className="rhythm-item-actions">
        <Button className="icon-button" type="button" variant={item.status === "done" ? "primary" : "secondary"} onClick={() => onStatus(item, "done")} title="Done">
          <Check size={17} />
        </Button>
        <Button className="icon-button" type="button" variant={item.status === "skipped" ? "primary" : "secondary"} onClick={() => onStatus(item, "skipped")} title="Skipped">
          <CircleSlash size={17} />
        </Button>
        <Button className="icon-button" type="button" variant={item.status === "carried" ? "primary" : "secondary"} onClick={() => onStatus(item, "carried")} title="Carry">
          <CornerUpRight size={17} />
        </Button>
        {item.href ? (
          <Link to={item.href} className="button button-ghost icon-button" title="Open">
            <Plus size={17} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function ownedWorkSourceFromDaily(sourceType: DailyBreadSourceItem["sourceType"]): OwnedWorkSourceType {
  if (sourceType === "chore") return "chore";
  if (sourceType === "animal") return "animal";
  if (sourceType === "garden") return "garden";
  if (sourceType === "pantry") return "pantry";
  if (sourceType === "preservation") return "preservation";
  if (sourceType === "weekly_huddle") return "weekly_huddle";
  return "daily_bread";
}
