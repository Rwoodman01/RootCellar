import { ArrowLeft, Check, Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { AnimalTargetSelect } from "../components/AnimalTargetSelect";
import { ANIMAL_EVENT_OPTIONS } from "../constants";
import { todayDate } from "../animalUtils";
import type { AnimalEventInput, AnimalEventType } from "../types";
import { useAnimals } from "../useAnimals";

export function QuickLogPage() {
  const { data, addEvent } = useAnimals();
  const [searchParams] = useSearchParams();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<AnimalEventInput>({
    groupId: searchParams.get("groupId") || undefined,
    animalId: searchParams.get("animalId") || undefined,
    eventType: "note",
    date: todayDate(),
    notes: "",
    followUpDate: "",
    quantityValue: undefined,
    unit: "",
    linkedChoreId: "",
  });

  const hasTargets = data.groups.length > 0 || data.individuals.length > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.groupId && !form.animalId) return;
    addEvent(form);
    setSaved(true);
    setForm((current) => ({ ...current, notes: "", followUpDate: "", quantityValue: undefined, unit: "" }));
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Quick log" title="Log an animal event fast">
        <p>Pick the group or animal, choose what happened, keep the date at today unless needed, and add a note.</p>
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
          Quick log needs something to attach the memory to.
        </EmptyState>
      ) : (
        <form className="form-panel" onSubmit={submit}>
          <div className="form-grid">
            <AnimalTargetSelect
              data={data}
              groupId={form.groupId}
              animalId={form.animalId}
              onChange={(target) => setForm((current) => ({ ...current, groupId: target.groupId, animalId: target.animalId }))}
              required
            />
            <label>
              Event type
              <select value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value as AnimalEventType })}>
                {ANIMAL_EVENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
            </label>
            <label>
              Follow-up date, optional
              <input type="date" value={form.followUpDate || ""} onChange={(event) => setForm({ ...form, followUpDate: event.target.value })} />
            </label>
            <label>
              Quantity or value, optional
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.quantityValue ?? ""}
                onChange={(event) => setForm({ ...form, quantityValue: event.target.value === "" ? undefined : Number(event.target.value) })}
                placeholder="12"
              />
            </label>
            <label>
              Unit, optional
              <input value={form.unit || ""} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="eggs, lb, ml, animals" />
            </label>
          </div>
          <label>
            Notes
            <textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="What should future you remember?" />
          </label>
          <div className="button-row">
            <Link className="button button-secondary" to="/animals">
              <ArrowLeft size={18} />
              Back
            </Link>
            <Button type="submit">
              <Plus size={18} />
              Log event
            </Button>
            {saved ? (
              <span className="inline-success" role="status">
                <Check size={16} />
                Saved
              </span>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
