import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { BrandMark } from "../shared/components/BrandMark";
import { Stepper } from "../shared/components/Stepper";
import { useOnboarding } from "./useOnboarding";
import { WelcomeStep } from "./steps/WelcomeStep";
import { RoomsStep } from "./steps/RoomsStep";
import { BasicsStep } from "./steps/BasicsStep";
import { FirstMemoryStep } from "./steps/FirstMemoryStep";
import { FinishStep } from "./steps/FinishStep";

const STEP_LABELS = ["Welcome", "Rooms", "Basics", "First memory", "Finish"];

export function OnboardingPage() {
  const { state, setStep } = useOnboarding();

  function handleSelectStep(step: number) {
    if (step <= state.step) setStep(step as typeof state.step);
  }

  return (
    <div className="onboarding-shell">
      <header className="landing-topbar">
        <BrandMark />
        <Link to="/settings" aria-label="Settings">
          <Settings size={20} />
        </Link>
      </header>
      <main className="onboarding-card">
        <Stepper steps={STEP_LABELS} current={state.step} done={STEP_LABELS.map((_, index) => index + 1 < state.step)} onSelect={handleSelectStep} />
        {state.step === 1 ? <WelcomeStep /> : null}
        {state.step === 2 ? <RoomsStep /> : null}
        {state.step === 3 ? <BasicsStep /> : null}
        {state.step === 4 ? <FirstMemoryStep /> : null}
        {state.step === 5 ? <FinishStep /> : null}
      </main>
    </div>
  );
}
