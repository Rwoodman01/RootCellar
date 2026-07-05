import { ArrowRight, ClipboardList, Home, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { rootcellarModules } from "../moduleRegistry";
import { BrandMark } from "../shared/components/BrandMark";
import { LinkButton } from "../shared/components/Button";
import { ModuleCard } from "../shared/components/ModuleCard";

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <BrandMark />
        <Link to="/settings" aria-label="Settings">
          <Settings size={20} />
        </Link>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-copy">
            <p className="eyebrow">Rootcellar Alpha</p>
            <h1>Your homestead finally remembers.</h1>
            <p>
              A household memory and rhythm app for gardeners, homesteaders, and self-reliant families. The first alpha
              is focused on preservation, pantry, garden, animal care, and chores.
            </p>
            <div className="landing-actions">
              <LinkButton to="/preservation">
                <ClipboardList size={18} />
                Open Preservation
              </LinkButton>
              <LinkButton to="/dashboard" variant="secondary">
                <Home size={18} />
                Go to dashboard
              </LinkButton>
            </div>
          </div>
          <div className="season-panel" aria-label="Preservation planner focus">
            <span>Beat the August Ambush</span>
            <h2>Plan your jars, freezer space, and canning sessions before harvest takes over the kitchen.</h2>
            <Link to="/preservation">
              Start the season plan
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="landing-modules" aria-labelledby="module-heading">
          <div className="section-heading">
            <p className="eyebrow">App foundation</p>
            <h2 id="module-heading">The V1 rooms are focused.</h2>
          </div>
          <div className="module-grid">
            {rootcellarModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
