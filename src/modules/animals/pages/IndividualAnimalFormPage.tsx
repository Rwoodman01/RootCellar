import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { ANIMAL_PURPOSE_OPTIONS, ANIMAL_SEX_OPTIONS, ANIMAL_STATUS_OPTIONS } from "../constants";
import type { AnimalPurpose, AnimalStatus } from "../types";
import { useAnimals, useIndividualAnimal } from "../useAnimals";

export function IndividualAnimalFormPage() {
  const { animalId } = useParams();
  const [searchParams] = useSearchParams();
  const animal = useIndividualAnimal(animalId);
  const { data, addIndividual, updateIndividual } = useAnimals();
  const navigate = useNavigate();
  const isEditing = Boolean(animalId);
  const startingGroup = data.groups.find((group) => group.id === searchParams.get("groupId"));

  const initial = useMemo(
    () => ({
      groupId: animal?.groupId || startingGroup?.id || "",
      name: animal?.name || "",
      species: animal?.species || startingGroup?.species || "",
      breed: animal?.breed || "",
      sex: animal?.sex || "",
      birthHatchDate: animal?.birthHatchDate || "",
      acquiredDate: animal?.acquiredDate || "",
      purpose: animal?.purpose || startingGroup?.purpose || "milk",
      status: animal?.status || "active",
      location: animal?.location || startingGroup?.location || "",
      notes: animal?.notes || "",
      photoPlaceholder: animal?.photoPlaceholder || "",
    }),
    [animal, startingGroup],
  );

  const [groupId, setGroupId] = useState(initial.groupId);
  const [name, setName] = useState(initial.name);
  const [species, setSpecies] = useState(initial.species);
  const [breed, setBreed] = useState(initial.breed);
  const [sex, setSex] = useState(initial.sex);
  const [birthHatchDate, setBirthHatchDate] = useState(initial.birthHatchDate);
  const [acquiredDate, setAcquiredDate] = useState(initial.acquiredDate);
  const [purpose, setPurpose] = useState<AnimalPurpose>(initial.purpose as AnimalPurpose);
  const [status, setStatus] = useState<AnimalStatus>(initial.status as AnimalStatus);
  const [location, setLocation] = useState(initial.location);
  const [notes, setNotes] = useState(initial.notes);
  const [photoPlaceholder, setPhotoPlaceholder] = useState(initial.photoPlaceholder);

  if (isEditing && !animal) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Animals" title="Animal not found" />
        <Link className="button button-secondary" to="/animals/individuals">
          <ArrowLeft size={18} />
          Back to individuals
        </Link>
      </div>
    );
  }

  const handleGroupChange = (nextGroupId: string) => {
    setGroupId(nextGroupId);
    const group = data.groups.find((entry) => entry.id === nextGroupId);
    if (!animal && group) {
      if (!species) setSpecies(group.species);
      if (!location) setLocation(group.location);
      setPurpose(group.purpose);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      groupId,
      name,
      species,
      breed,
      sex,
      birthHatchDate,
      acquiredDate,
      purpose,
      status,
      location,
      notes,
      photoPlaceholder,
    };
    const saved = animal ? (updateIndividual(animal.id, input), animal) : addIndividual(input);
    navigate(`/animals/individuals/${saved.id}`);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Individual animal" title={animal ? `Edit ${animal.name}` : "Add individual animal"}>
        <p>Keep individual history for animals that need their own care, health, production, or reproduction notes.</p>
      </PageHeader>

      <form className="form-panel" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Group, optional
            <select value={groupId} onChange={(event) => handleGroupChange(event.target.value)}>
              <option value="">No group</option>
              {data.groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.species})
                </option>
              ))}
            </select>
          </label>
          <label>
            Name or tag number
            <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Clover, Rosie, Tag 42" />
          </label>
          <label>
            Species
            <input value={species} onChange={(event) => setSpecies(event.target.value)} required placeholder="Goat" />
          </label>
          <label>
            Breed, optional
            <input value={breed} onChange={(event) => setBreed(event.target.value)} placeholder="Nubian, Jersey, Kiko" />
          </label>
          <label>
            Sex, optional
            <select value={sex} onChange={(event) => setSex(event.target.value)}>
              {ANIMAL_SEX_OPTIONS.map((option) => (
                <option key={option || "blank"} value={option}>
                  {option ? option[0].toUpperCase() + option.slice(1) : "Not recorded"}
                </option>
              ))}
            </select>
          </label>
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
            Birth or hatch date, optional
            <input type="date" value={birthHatchDate} onChange={(event) => setBirthHatchDate(event.target.value)} />
          </label>
          <label>
            Acquired date, optional
            <input type="date" value={acquiredDate} onChange={(event) => setAcquiredDate(event.target.value)} />
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
          <label>
            Location
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Barn, pasture, kennel" />
          </label>
        </div>
        <label>
          Photo placeholder
          <input value={photoPlaceholder} onChange={(event) => setPhotoPlaceholder(event.target.value)} placeholder="Photo support coming later" />
        </label>
        <label>
          Notes
          <textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <div className="button-row">
          <Link className="button button-secondary" to={animal ? `/animals/individuals/${animal.id}` : "/animals/individuals"}>
            <ArrowLeft size={18} />
            Back
          </Link>
          <Button type="submit">
            <Save size={18} />
            Save animal
          </Button>
        </div>
      </form>
    </div>
  );
}

