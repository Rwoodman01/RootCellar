import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/Button";
import { usePantry } from "../../modules/pantry/usePantry";
import { useGarden } from "../../modules/garden/useGarden";
import { useAnimals } from "../../modules/animals/useAnimals";
import { useChores } from "../../modules/chores/useChores";
import { usePreservationPlans } from "../../modules/preservation/usePreservationPlans";
import { confirmAndLoadSampleHomestead } from "../../shared/storage/sampleHomestead";
import { useOnboarding } from "../useOnboarding";

export function FinishStep() {
  const navigate = useNavigate();
  const { state, setStep, completeOnboarding } = useOnboarding();
  const pantry = usePantry();
  const garden = useGarden();
  const animals = useAnimals();
  const chores = useChores();
  const preservation = usePreservationPlans();

  const recordsCreated =
    chores.data.members.length + chores.data.chores.length + pantry.data.products.length + garden.data.beds.length + animals.data.groups.length + preservation.plans.length;

  function finish() {
    completeOnboarding("finished");
    navigate("/daily-bread");
  }

  function loadSample() {
    confirmAndLoadSampleHomestead({ completeOnboarding: true });
  }

  return (
    <section>
      <p className="eyebrow">Step 5</p>
      <h1>Finish</h1>
      <p>Good. Rootcellar has its first memory. Daily Bread will help you carry today.</p>

      <div className="summary-strip" aria-label="Onboarding summary">
        <div>
          <span>Rooms selected</span>
          <strong>{state.selectedRooms.length}</strong>
        </div>
        <div>
          <span>Records created</span>
          <strong>{recordsCreated}</strong>
        </div>
      </div>

      {state.selectedRooms.includes("garden") ? (
        <p className="muted">
          Next best action: <Link to="/garden/targets">plan backward from a food goal</Link> in Garden.
        </p>
      ) : null}

      <div className="onboarding-actions">
        <Button type="button" onClick={finish}>
          Go to Daily Bread
          <ArrowRight size={18} />
        </Button>
        <Button type="button" variant="secondary" onClick={() => setStep(4)}>
          Add another record
        </Button>
        <Button type="button" variant="ghost" onClick={loadSample}>
          Load sample homestead
        </Button>
      </div>
    </section>
  );
}
