import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { currentYear } from "../../../shared/utils/dates";
import { PlanNotFound } from "../components/PlanNotFound";
import { usePreservationPlan, usePreservationPlans } from "../usePreservationPlans";

export function PreservationPlanFormPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const existingPlan = usePreservationPlan(planId);
  const { createPlan, updatePlan } = usePreservationPlans();
  const isEditing = Boolean(planId);

  const initial = useMemo(
    () => ({
      title: existingPlan?.title || `${currentYear()} Preservation Season`,
      householdName: existingPlan?.householdName || "Our household",
      seasonYear: existingPlan?.seasonYear || currentYear(),
      notes: existingPlan?.notes || "",
    }),
    [existingPlan],
  );

  const [title, setTitle] = useState(initial.title);
  const [householdName, setHouseholdName] = useState(initial.householdName);
  const [seasonYear, setSeasonYear] = useState(initial.seasonYear);
  const [notes, setNotes] = useState(initial.notes);

  if (isEditing && !existingPlan) {
    return <PlanNotFound />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input = { title, householdName, seasonYear, notes };

    if (existingPlan) {
      updatePlan(existingPlan.id, input);
      navigate(`/preservation/${existingPlan.id}`);
      return;
    }

    const plan = createPlan(input);
    navigate(`/preservation/${plan.id}`);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Preservation" title={existingPlan ? "Edit season plan" : "New season plan"}>
        <p>Name the season and household notes before the item list starts growing.</p>
      </PageHeader>

      <form className="form-panel" onSubmit={handleSubmit}>
        <label>
          Plan name
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <div className="form-grid">
          <label>
            Household
            <input value={householdName} onChange={(event) => setHouseholdName(event.target.value)} />
          </label>
          <label>
            Season year
            <input
              type="number"
              min="2020"
              max="2100"
              value={seasonYear}
              onChange={(event) => setSeasonYear(Number(event.target.value))}
            />
          </label>
        </div>
        <label>
          Season notes
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} />
        </label>
        <div className="button-row">
          <Link className="button button-secondary" to={existingPlan ? `/preservation/${existingPlan.id}` : "/preservation"}>
            <ArrowLeft size={18} />
            Back
          </Link>
          <Button type="submit">
            <Save size={18} />
            Save plan
          </Button>
        </div>
      </form>
    </div>
  );
}
