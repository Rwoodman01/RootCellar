import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/Button";
import { confirmAndLoadSampleHomestead } from "../../shared/storage/sampleHomestead";
import { useOnboarding } from "../useOnboarding";

export function WelcomeStep() {
  const navigate = useNavigate();
  const { setStep, completeOnboarding } = useOnboarding();

  function skip() {
    completeOnboarding("skipped");
    navigate("/daily-bread");
  }

  function loadSample() {
    confirmAndLoadSampleHomestead({ completeOnboarding: true });
  }

  return (
    <section>
      <p className="eyebrow">Rootcellar Alpha</p>
      <h1>Welcome to Rootcellar</h1>
      <p>Rootcellar is where your homestead finally remembers. Start with the rooms you use now. You can add the rest later.</p>
      <div className="onboarding-actions">
        <Button type="button" onClick={() => setStep(2)}>
          Start setup
          <ArrowRight size={18} />
        </Button>
        <Button type="button" variant="secondary" onClick={loadSample}>
          Load sample homestead
        </Button>
        <Button type="button" variant="ghost" onClick={skip}>
          Skip for now
        </Button>
      </div>
    </section>
  );
}
