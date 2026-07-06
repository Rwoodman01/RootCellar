import { Check, CircleSlash, CornerUpRight, MoreHorizontal, Plus, Wheat } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { useAnimals } from "../../animals/useAnimals";
import { useChores } from "../../chores/useChores";
import { useGarden } from "../../garden/useGarden";
import { usePantry } from "../../pantry/usePantry";
import { usePreservationPlans } from "../../preservation/usePreservationPlans";
import { addDays, getDailyBreadItems, mergeDailyBreadStatuses, todayDate, type DailyBreadSourceItem } from "../rhythmUtils";
import type { DailyBreadItemStatus, OwnedWorkSourceType } from "../types";
import { useHuddle } from "../useHuddle";

const groupLabels: Record<DailyBreadSourceItem["group"], string> = {
  owned: "Owned",
  chores: "Chores",
  animals: "Animals",
  garden: "Garden",
  pantry: "Pantry",
  preservation: "Preserve",
  carry: "Carried",
};

const groupOrder: DailyBreadSourceItem["group"][] = ["carry", "owned", "chores", "animals", "pantry", "preservation", "garden"];

export function DailyBreadPage() {
  const today = todayDate();
  const huddle = useHuddle();
  const { plans } = usePreservationPlans();
  const { data: pantry } = usePantry();
  const { data: animals } = useAnimals();
  const { data: garden } = useGarden();
  const { data: chores, activeMember, completeChore, skipChore } = useChores();
  const entry = huddle.data.dailyBreadEntries.find((item) => item.date === today);
  const [focusValue, setFocusValue] = useState(entry?.todayFocus || "");
  const [noteForm, setNoteForm] = useState({
    householdNote: entry?.householdNote || "",
    gratitude: entry?.gratitude || "",
    prayerOrReflection: entry?.prayerOrReflection || "",
  });
  const [addOpen, setAddOpen] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState("");
  const [newWorkOwner, setNewWorkOwner] = useState(activeMember?.id || "");

  useEffect(() => {
    setFocusValue(entry?.todayFocus || "");
    setNoteForm({
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

  const sortedItems = useMemo(() => {
    return [...dailyItems].sort((a, b) => {
      const rank = (item: DailyBreadSourceItem) => (item.status === "carried" ? 0 : item.dueDate && item.dueDate <= today ? 1 : 2);
      const rankDiff = rank(a) - rank(b);
      if (rankDiff !== 0) return rankDiff;
      return groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group);
    });
  }, [dailyItems, today]);

  const doneCount = dailyItems.filter((item) => item.status === "done").length;
  const carriedCount = dailyItems.filter((item) => item.status === "carried").length;

  function saveFocus() {
    huddle.updateDailyBreadNotes(today, { todayFocus: focusValue });
  }

  function saveNotes() {
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
    setAddOpen(false);
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
      <PageHeader
        eyebrow={formatShortDate(today)}
        title="What needs carrying today?"
        actions={
          <Button type="button" onClick={() => huddle.completeDailyBread(today)} variant={entry?.completedAt ? "secondary" : "primary"}>
            <Wheat size={18} />
            {entry?.completedAt ? "Completed" : "Close today"}
          </Button>
        }
      >
        <input
          className="daily-focus-input"
          value={focusValue}
          onChange={(event) => setFocusValue(event.target.value)}
          onBlur={saveFocus}
          placeholder="Set today's focus"
        />
      </PageHeader>

      {dailyItems.length === 0 ? (
        <EmptyState title="The day is quiet" action={<Wheat size={24} />}>
          No due chores, care reminders, garden dates, use-soon pantry notes, preservation sessions, or carry-forward work surfaced for today.
        </EmptyState>
      ) : (
        <div className="compact-list daily-bread-list" aria-label="Today's carry list">
          {sortedItems.map((item) => (
            <DailyBreadCard key={`${item.sourceType}:${item.sourceId || item.title}`} item={item} onStatus={setItemStatus} />
          ))}
        </div>
      )}

      <p className="muted daily-bread-tally">
        {doneCount} done · {carriedCount} carried
      </p>

      {addOpen ? (
        <form className="form-panel rhythm-inline-form" onSubmit={addOwnedWork}>
          <div className="form-grid">
            <label>
              Work
              <input autoFocus value={newWorkTitle} onChange={(event) => setNewWorkTitle(event.target.value)} placeholder="Call the hay supplier" />
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
          <div className="button-row">
            <Button type="submit">Add</Button>
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setAddOpen(true)}>
          <Plus size={18} />
          Add something
        </Button>
      )}

      <details className="rhythm-disclosure">
        <summary>Evening note</summary>
        <form
          className="form-panel"
          onSubmit={(event) => {
            event.preventDefault();
            saveNotes();
          }}
        >
          <label>
            Note
            <textarea rows={2} value={noteForm.householdNote} onChange={(event) => setNoteForm((current) => ({ ...current, householdNote: event.target.value }))} onBlur={saveNotes} />
          </label>
          <label>
            Gratitude
            <textarea rows={2} value={noteForm.gratitude} onChange={(event) => setNoteForm((current) => ({ ...current, gratitude: event.target.value }))} onBlur={saveNotes} />
          </label>
          <label>
            Prayer or reflection
            <textarea rows={2} value={noteForm.prayerOrReflection} onChange={(event) => setNoteForm((current) => ({ ...current, prayerOrReflection: event.target.value }))} onBlur={saveNotes} />
          </label>
        </form>
      </details>
    </div>
  );
}

function DailyBreadCard({ item, onStatus }: { item: DailyBreadSourceItem; onStatus: (item: DailyBreadSourceItem, status: DailyBreadItemStatus) => void }) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  return (
    <article className={`rhythm-item rhythm-item-${item.status}`}>
      <div>
        <span className="daily-bread-badge">{groupLabels[item.group]}</span>
        <strong>{item.title}</strong>
        <span>{item.detail}</span>
        {item.dueDate ? <small>{formatShortDate(item.dueDate)}</small> : null}
      </div>
      <div className="rhythm-item-actions">
        <Button className="icon-button" type="button" variant={item.status === "done" ? "primary" : "secondary"} onClick={() => onStatus(item, "done")} title="Done">
          <Check size={17} />
        </Button>
        <Button className="icon-button" type="button" variant={item.status === "carried" ? "primary" : "secondary"} onClick={() => onStatus(item, "carried")} title="Carry">
          <CornerUpRight size={17} />
        </Button>
        <details className="daily-bread-overflow" ref={menuRef}>
          <summary className="icon-button button button-ghost" aria-label="More actions">
            <MoreHorizontal size={17} />
          </summary>
          <div className="daily-bread-overflow-menu">
            <button
              type="button"
              onClick={() => {
                onStatus(item, "skipped");
                menuRef.current?.removeAttribute("open");
              }}
            >
              <CircleSlash size={16} />
              Skip
            </button>
            {item.href ? (
              <Link to={item.href}>
                <Plus size={16} />
                Open
              </Link>
            ) : null}
          </div>
        </details>
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
