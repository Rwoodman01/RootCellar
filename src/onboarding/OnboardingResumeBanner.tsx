import { Link } from "react-router-dom";
import { Button } from "../shared/components/Button";
import { useOnboarding } from "./useOnboarding";

export function OnboardingResumeBanner() {
  const { state, dismissResumeBanner } = useOnboarding();

  if (state.completionKind !== "skipped" || state.resumeBannerDismissed || state.sampleDataLoaded) return null;

  return (
    <section className="resume-banner" aria-label="Finish setting up Rootcellar">
      <p>Finish setting up Rootcellar. It takes about two minutes.</p>
      <div className="button-row">
        <Link to="/onboarding" className="button button-secondary">
          Resume
        </Link>
        <Button type="button" variant="ghost" onClick={dismissResumeBanner}>
          Dismiss
        </Button>
      </div>
    </section>
  );
}
