import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { ANIMAL_PURPOSE_OPTIONS, ANIMAL_STATUS_OPTIONS, SPECIES_TEMPLATES } from "../constants";
import { todayDate } from "../animalUtils";
import type { AnimalPurpose, AnimalStatus } from "../types";
import { useAnimalGroup, useAnimals } from "../useAnimals";

export function AnimalGroupFormPage() {
  const { groupId } = useParams();
  const group = useAnimalGroup(groupId);
  const { addGroup, updateGroup } = useAnimals();
  const navigate = useNavigate();
  const isEditing = Boolean(groupId);

  const initial = useMemo(
    () => ({
      name: group?.name || "",
      species: group?.species || "",
      purpose: group?.purpose || "eggs",
      count: group?.count || 1,
      location: group?.location || "",
      startDate: group?.startDate || todayDate(),
      status: group?.status || "active",
      notes: group?.notes || "",
    }),
    [group],
  );

  const [name, setName] = useState(initial.name);
  const [species, setSpecies] = useState(initial.species);
  const [purpose, setPurpose] = useState<AnimalPurpose>(initial.purpose as AnimalPurpose);
  const [count, setCount] = useState(initial.count);
  const [location, setLocation] = useState(initial.location);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [status, setStatus] = useState<AnimalStatus>(initial.status as AnimalStatus);
  const [notes, setNotes] = useState(initial.notes);

  if (isEditing && !group) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Animals" title="Group not found" />
        <Link className="button button-secondary" to="/animals/groups">
          <ArrowLeft size={18} />
          Back to groups
        </Link>
      </div>
    );
  }

  const applyTemplate = (templateId: string) => {
    const template = SPECIES_TEMPLATES.find((entry) => entry.id === templateId);
    if (!template) return;
    setName(template.name);
    setSpecies(template.species);
    setPurpose(template.purpose);
    setCount(template.count);
    setLocation(template.location);
    setNotes(template.notes);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = { name, species, purpose, count, location, startDate, status, notes };
    const saved = group ? (updateGroup(group.id, input), group) : addGroup(input);
    navigate(`/animals/groups/${saved.id}`);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Animal group" title={group ? `Edit ${group.name}` : "Add animal group"}>
        <p>Group records are for animals managed together. Individual animals can still be linked later.</p>
      </PageHeader>

      <form className="form-panel" onSubmit={submit}>
        {!group ? (
          <label>
            Starter template
            <select value="" onChange={(event) => applyTemplate(event.target.value)}>
              <option value="">Start blank</option>
              {SPECIES_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="form-grid">
          <label>
            Group name
            <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Laying flock" />
          </label>
          <label>
            Species
            <input value={species} onChange={(event) => setSpecies(event.target.value)} required placeholder="Chickens" />
          </label>
          <label>
            Count
            <input type="number" min="0" step="1" value={count} onChange={(event) => setCount(Number(event.target.value))} />
          </label>
        </div>

        <details className="more-details">
          <summary>More details (purpose, location, status, notes)</summary>
          <div className="form-grid">
            <label>
              Purpose
              <select value={purpose} onChange={(event) => setPurpose(event.target.value as AnimalPurpose)}>
                {ANIMAL_PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Coop, pasture, brooder" />
            </label>
            <label>
              Start date
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label>
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as AnimalStatus)}>
                {ANIMAL_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Notes
            <textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </details>

        <div className="button-row">
          <Link className="button button-secondary" to={group ? `/animals/groups/${group.id}` : "/animals/groups"}>
            <ArrowLeft size={18} />
            Back
          </Link>
          <Button type="submit">
            <Save size={18} />
            Save group
          </Button>
        </div>
      </form>
    </div>
  );
}

