import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/components/Button";
import { CATEGORY_OPTIONS } from "../../modules/pantry/constants";
import type { PantryCategory } from "../../modules/pantry/types";
import { usePantry } from "../../modules/pantry/usePantry";
import { useGarden } from "../../modules/garden/useGarden";
import { useAnimals } from "../../modules/animals/useAnimals";
import type { AnimalPurpose } from "../../modules/animals/types";
import { useChores } from "../../modules/chores/useChores";
import { usePreservationPlans } from "../../modules/preservation/usePreservationPlans";
import { currentYear } from "../../shared/utils/dates";
import { useOnboarding } from "../useOnboarding";

export function FirstMemoryStep() {
  const { state, setStep } = useOnboarding();

  return (
    <section>
      <p className="eyebrow">Step 4</p>
      <h1>Create your first useful memory</h1>
      <p>One real record is enough. Add what you know now; skip the rest.</p>

      <div className="page-stack">
        {state.selectedRooms.includes("pantry") ? <PantryMemoryPanel /> : null}
        {state.selectedRooms.includes("garden") ? <GardenMemoryPanel /> : null}
        {state.selectedRooms.includes("animals") ? <AnimalsMemoryPanel /> : null}
        {state.selectedRooms.includes("chores") ? <ChoresMemoryPanel /> : null}
        {state.selectedRooms.includes("preservation") ? <PreservationMemoryPanel /> : null}
      </div>

      <div className="onboarding-actions">
        <Button type="button" variant="secondary" onClick={() => setStep(3)}>
          <ArrowLeft size={18} />
          Back
        </Button>
        <Button type="button" onClick={() => setStep(5)}>
          Continue
          <ArrowRight size={18} />
        </Button>
      </div>
    </section>
  );
}

function PantryMemoryPanel() {
  const pantry = usePantry();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PantryCategory>("jars-canned");

  function add() {
    if (!name.trim()) return;
    pantry.addProduct({ name, category, defaultRotationMonths: 12, lowStockThreshold: 1, notes: "" });
    setName("");
  }

  return (
    <article className="form-panel rhythm-inline-form">
      <div className="section-heading">
        <p className="eyebrow">Pantry</p>
        <h2>Add your first pantry item</h2>
      </div>
      {pantry.data.products.length ? <p className="muted">Saved: {pantry.data.products[0].name}</p> : null}
      <div className="form-grid">
        <label>
          Item
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tomato sauce" />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as PantryCategory)}>
            {CATEGORY_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button type="button" variant="secondary" onClick={add}>
        <Plus size={18} />
        Add pantry item
      </Button>
    </article>
  );
}

function GardenMemoryPanel() {
  const garden = useGarden();
  const [name, setName] = useState("");
  const [lengthFeet, setLengthFeet] = useState(8);

  function add() {
    if (!name.trim()) return;
    garden.addBed({
      name,
      areaName: "Main garden",
      planningMode: "row-feet",
      lengthFeet,
      widthFeet: 4,
      rowFeetCapacity: lengthFeet,
      sun: "full-sun",
      soilNotes: "",
      notes: "",
    });
    setName("");
  }

  return (
    <article className="form-panel rhythm-inline-form">
      <div className="section-heading">
        <p className="eyebrow">Garden</p>
        <h2>Add your first bed</h2>
      </div>
      {garden.data.beds.length ? <p className="muted">Saved: {garden.data.beds[0].name}</p> : null}
      <div className="form-grid">
        <label>
          Bed name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="North bed" />
        </label>
        <label>
          Row feet
          <input type="number" min={0} value={lengthFeet} onChange={(event) => setLengthFeet(Number(event.target.value) || 0)} />
        </label>
      </div>
      <Button type="button" variant="secondary" onClick={add}>
        <Plus size={18} />
        Add bed
      </Button>
    </article>
  );
}

function AnimalsMemoryPanel() {
  const animals = useAnimals();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [count, setCount] = useState(1);

  function add() {
    if (!name.trim()) return;
    animals.addGroup({ name, species: species || "Animals", purpose: "other" as AnimalPurpose, count, location: "", startDate: new Date().toISOString().slice(0, 10), status: "active", notes: "" });
    setName("");
    setSpecies("");
  }

  return (
    <article className="form-panel rhythm-inline-form">
      <div className="section-heading">
        <p className="eyebrow">Animals</p>
        <h2>Add your first animal group</h2>
      </div>
      {animals.data.groups.length ? <p className="muted">Saved: {animals.data.groups[0].name}</p> : null}
      <div className="form-grid">
        <label>
          Group name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Laying flock" />
        </label>
        <label>
          Species
          <input value={species} onChange={(event) => setSpecies(event.target.value)} placeholder="Chicken" />
        </label>
        <label>
          Count
          <input type="number" min={0} value={count} onChange={(event) => setCount(Number(event.target.value) || 0)} />
        </label>
      </div>
      <Button type="button" variant="secondary" onClick={add}>
        <Plus size={18} />
        Add animal group
      </Button>
    </article>
  );
}

function ChoresMemoryPanel() {
  const chores = useChores();
  const [title, setTitle] = useState("");
  const [ownerMemberId, setOwnerMemberId] = useState(chores.data.members[0]?.id || "");

  function add() {
    if (!title.trim()) return;
    chores.addChore({
      title,
      ownerMemberId,
      recurrenceType: "fixed",
      recurrenceParams: { cadence: "daily", daysOfWeek: [], dayOfMonth: 1, block: "Anytime", startDate: new Date().toISOString().slice(0, 10) },
      effort: "M",
      verification: "trust",
      status: "active",
    });
    setTitle("");
  }

  return (
    <article className="form-panel rhythm-inline-form">
      <div className="section-heading">
        <p className="eyebrow">Chores</p>
        <h2>Add your first chore</h2>
      </div>
      {chores.data.chores.length ? <p className="muted">Saved: {chores.data.chores[0].title}</p> : null}
      <div className="form-grid">
        <label>
          Chore
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Feed and water" />
        </label>
        <label>
          Owner
          <select value={ownerMemberId} onChange={(event) => setOwnerMemberId(event.target.value)}>
            <option value="">Household</option>
            {chores.data.members.map((member) => (
              <option value={member.id} key={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button type="button" variant="secondary" onClick={add}>
        <Plus size={18} />
        Add chore
      </Button>
    </article>
  );
}

function PreservationMemoryPanel() {
  const preservation = usePreservationPlans();
  const [title, setTitle] = useState("");

  function add() {
    preservation.createPlan({ title: title || undefined, seasonYear: currentYear() });
    setTitle("");
  }

  return (
    <article className="form-panel rhythm-inline-form">
      <div className="section-heading">
        <p className="eyebrow">Preservation</p>
        <h2>Start your first preservation plan</h2>
      </div>
      {preservation.plans.length ? <p className="muted">Saved: {preservation.plans[0].title}</p> : null}
      <div className="form-grid">
        <label>
          Plan title
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="This year's canning season" />
        </label>
      </div>
      <Button type="button" variant="secondary" onClick={add}>
        <Plus size={18} />
        Start plan
      </Button>
    </article>
  );
}
