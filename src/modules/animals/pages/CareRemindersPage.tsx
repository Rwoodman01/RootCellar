import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { AnimalTargetSelect } from "../components/AnimalTargetSelect";
import { sortedReminders, targetLabel, todayDate } from "../animalUtils";
import type { CareReminderInput } from "../types";
import { useAnimals } from "../useAnimals";

const reminderExamples = ["worm goats", "clean brooder", "move meat birds", "hoof trim", "check mineral feeder", "collect eggs"];

export function CareRemindersPage() {
  const { data, addCareReminder } = useAnimals();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<CareReminderInput>({
    groupId: searchParams.get("groupId") || undefined,
    animalId: searchParams.get("animalId") || undefined,
    title: "",
    suggestedCadence: "",
    nextDueDate: todayDate(),
    notes: "",
  });
  const hasTargets = data.groups.length > 0 || data.individuals.length > 0;
  const reminders = sortedReminders(data.careReminders);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.groupId && !form.animalId) return;
    addCareReminder(form);
    setForm((current) => ({ ...current, title: "", suggestedCadence: "", notes: "" }));
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Care reminders" title="Upcoming animal care dates">
        <p>Animal-local reminders live here for now. The chore integration field is kept as a placeholder for the future Chores module.</p>
      </PageHeader>

      {!hasTargets ? (
        <EmptyState
          title="Add a group or animal first"
          action={
            <LinkButton to="/animals/groups/new">
              <Plus size={18} />
              Add animal group
            </LinkButton>
          }
        >
          Care reminders need a group or individual animal to attach to.
        </EmptyState>
      ) : (
        <section className="animal-dashboard-grid">
          <form className="form-panel" onSubmit={submit}>
            <div className="section-heading">
              <p className="eyebrow">New reminder</p>
              <h2>Add care date</h2>
            </div>
            <AnimalTargetSelect
              data={data}
              groupId={form.groupId}
              animalId={form.animalId}
              onChange={(target) => setForm((current) => ({ ...current, groupId: target.groupId, animalId: target.animalId }))}
              required
            />
            <div className="form-grid">
              <label>
                Title
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required placeholder="hoof trim" list="animal-reminder-examples" />
                <datalist id="animal-reminder-examples">
                  {reminderExamples.map((example) => (
                    <option key={example} value={example} />
                  ))}
                </datalist>
              </label>
              <label>
                Suggested cadence
                <input value={form.suggestedCadence} onChange={(event) => setForm({ ...form, suggestedCadence: event.target.value })} placeholder="monthly, weekly, before frost" />
              </label>
              <label>
                Next due date
                <input type="date" value={form.nextDueDate} onChange={(event) => setForm({ ...form, nextDueDate: event.target.value })} required />
              </label>
            </div>
            <label>
              Notes
              <textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <Button type="submit">
              <Plus size={18} />
              Add reminder
            </Button>
          </form>

          <div className="pantry-panel">
            <div className="section-heading">
              <p className="eyebrow">Upcoming</p>
              <h2>Care dates</h2>
            </div>
            <div className="compact-list">
              {reminders.map((reminder) => (
                <div className="compact-row" key={reminder.id}>
                  <strong>{reminder.title}</strong>
                  <span>
                    {targetLabel(data, reminder)}
                    {reminder.suggestedCadence ? ` - ${reminder.suggestedCadence}` : ""}
                  </span>
                  <small>
                    {formatShortDate(reminder.nextDueDate)} - Chores placeholder
                  </small>
                </div>
              ))}
              {reminders.length === 0 ? <p className="muted">No care reminders yet.</p> : null}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
