import { ArrowRight, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { roomModules } from "../moduleRegistry";
import { LinkButton } from "../shared/components/Button";
import { ModuleCard } from "../shared/components/ModuleCard";
import { PageHeader } from "../shared/components/PageHeader";
import { loadRootcellarData } from "../shared/storage/rootcellarStorage";
import { OnboardingResumeBanner } from "../onboarding/OnboardingResumeBanner";
import { useHuddle } from "../modules/huddle/useHuddle";
import { useChores } from "../modules/chores/useChores";
import { useAnimals } from "../modules/animals/useAnimals";
import { useGarden } from "../modules/garden/useGarden";
import { usePantry } from "../modules/pantry/usePantry";
import { usePreservationPlans } from "../modules/preservation/usePreservationPlans";
import { getDailyBreadItems, getWeeklySignals } from "../modules/huddle/rhythmUtils";

export function HomesteadPage() {
  const { plans } = usePreservationPlans();
  const { data: pantry } = usePantry();
  const { data: animals } = useAnimals();
  const { data: chores } = useChores();
  const { data: garden } = useGarden();
  const { data: rhythm } = useHuddle();
  const householdName = loadRootcellarData().householdProfile.householdName;

  const dailyBreadItems = getDailyBreadItems({ huddle: rhythm, chores, animals, garden, pantry, preservationPlans: plans }).length;
  const weeklySignals = getWeeklySignals({ huddle: rhythm, chores, animals, garden, pantry, preservationPlans: plans }).length;
  const openOwnedWork = rhythm.ownedWorkItems.filter((item) => item.status === "open" || item.status === "carried").length;
  const openStuck = rhythm.stuckItems.filter((item) => item.status === "open" || item.status === "carried").length;

  return (
    <div className="page-stack">
      <OnboardingResumeBanner />
      <PageHeader
        eyebrow="Homestead"
        title={`${householdName} at a glance`}
        actions={
          <LinkButton to="/settings" variant="secondary">
            <Settings size={18} />
            About
          </LinkButton>
        }
      >
        <p>Everything still stays local to this browser.</p>
      </PageHeader>

      <section className="summary-strip" aria-label="Rhythm summary">
        <Link to="/daily-bread" className="summary-main">
          <span>Daily Bread</span>
          <strong>{dailyBreadItems}</strong>
          <small>Need carrying today</small>
          <ArrowRight size={18} />
        </Link>
        <Link to="/huddle" className="summary-main">
          <span>Weekly Huddle</span>
          <strong>{weeklySignals}</strong>
          <small>Signals to review</small>
          <ArrowRight size={18} />
        </Link>
        <div>
          <span>Owned work</span>
          <strong>{openOwnedWork}</strong>
          <small>Open or carried</small>
        </div>
        <div>
          <span>Needs attention</span>
          <strong>{openStuck}</strong>
          <small>Stuck list</small>
        </div>
      </section>

      <section className="page-section" aria-labelledby="module-heading">
        <div className="section-heading">
          <p className="eyebrow">Rooms</p>
          <h2 id="module-heading">The homestead's rooms</h2>
        </div>
        <div className="module-grid">
          {roomModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>
    </div>
  );
}
