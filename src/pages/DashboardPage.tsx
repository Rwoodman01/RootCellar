import { ArrowRight, ClipboardCheck, ClipboardList, HandHeart, Package, PawPrint, Plus, Settings, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { rootcellarModules } from "../moduleRegistry";
import { LinkButton } from "../shared/components/Button";
import { ModuleCard } from "../shared/components/ModuleCard";
import { PageHeader } from "../shared/components/PageHeader";
import { usePreservationPlans } from "../modules/preservation/usePreservationPlans";
import { estimatePlan } from "../modules/preservation/estimates";
import { usePantry } from "../modules/pantry/usePantry";
import { getLowStockProducts, getUseSoonBatches } from "../modules/pantry/pantryUtils";
import { useAnimals } from "../modules/animals/useAnimals";
import { activeGroups, activeIndividuals, dueCareReminders } from "../modules/animals/animalUtils";
import { useChores } from "../modules/chores/useChores";
import { getChoreUrgency, getChoresByPerson, getTodayChores, getUpcomingSeasonChores } from "../modules/chores/choreUtils";
import { useGarden } from "../modules/garden/useGarden";
import { useHuddle } from "../modules/huddle/useHuddle";
import { getDailyBreadItems, getWeeklySignals } from "../modules/huddle/rhythmUtils";

export function DashboardPage() {
  const { plans } = usePreservationPlans();
  const { data: pantry } = usePantry();
  const { data: animals } = useAnimals();
  const { data: chores } = useChores();
  const { data: garden } = useGarden();
  const { data: rhythm } = useHuddle();
  const latestPlan = plans[0];
  const totals = latestPlan ? estimatePlan(latestPlan.items) : null;
  const lowStock = getLowStockProducts(pantry).length;
  const useSoon = getUseSoonBatches(pantry).length;
  const activeAnimalGroups = activeGroups(animals.groups).length;
  const activeAnimalIndividuals = activeIndividuals(animals.individuals).length;
  const animalCareDue = dueCareReminders(animals.careReminders).length;
  const choreDueToday = getTodayChores(chores).length;
  const ripeChores = chores.chores.filter((chore) => {
    const urgency = getChoreUrgency(chore, chores.completions, undefined, chores);
    return chore.status === "active" && (urgency.status === "ready_soon" || urgency.status === "ready" || urgency.status === "getting_ripe");
  }).length;
  const choreLoad = getChoresByPerson(chores).filter((entry) => entry.chores.length).length;
  const upcomingSeasonChores = getUpcomingSeasonChores(chores).length;
  const dailyBreadItems = getDailyBreadItems({ huddle: rhythm, chores, animals, garden, pantry, preservationPlans: plans }).length;
  const weeklySignals = getWeeklySignals({ huddle: rhythm, chores, animals, garden, pantry, preservationPlans: plans }).length;
  const openOwnedWork = rhythm.ownedWorkItems.filter((item) => item.status === "open" || item.status === "carried").length;
  const openStuck = rhythm.stuckItems.filter((item) => item.status === "open" || item.status === "carried").length;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Dashboard"
        title="What needs remembering this season?"
        actions={
          <LinkButton to="/settings" variant="secondary">
            <Settings size={18} />
            About
          </LinkButton>
        }
      >
          <p>Rootcellar now covers preservation, pantry, garden, animal care, and family work ownership. Everything still stays local to this browser.</p>
      </PageHeader>

      <section className="focus-band">
        <div>
          <p className="eyebrow">Active alpha modules</p>
          <h2>Plan food, track stores, and turn memory into traction.</h2>
          <p>Daily Bread carries today. Weekly Huddle gathers what worked, what slipped, and who owns what next. Everything still stays local to this browser.</p>
        </div>
        <div className="focus-actions">
          <LinkButton to="/daily-bread">
            <Wheat size={18} />
            Daily Bread
          </LinkButton>
          <LinkButton to="/huddle" variant="secondary">
            <HandHeart size={18} />
            Weekly Huddle
          </LinkButton>
          <LinkButton to="/preservation">
            <ClipboardList size={18} />
            Open preservation
          </LinkButton>
          <LinkButton to="/preservation/new" variant="secondary">
            <Plus size={18} />
            New plan
          </LinkButton>
          <LinkButton to="/pantry" variant="secondary">
            <Package size={18} />
            Open pantry
          </LinkButton>
          <LinkButton to="/animals" variant="secondary">
            <PawPrint size={18} />
            Open animals
          </LinkButton>
          <LinkButton to="/chores" variant="secondary">
            <ClipboardCheck size={18} />
            Open chores
          </LinkButton>
        </div>
      </section>

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

      {latestPlan ? (
        <section className="summary-strip" aria-label="Latest preservation plan summary">
          <Link to={`/preservation/${latestPlan.id}`} className="summary-main">
            <span>Latest plan</span>
            <strong>{latestPlan.title}</strong>
            <small>{latestPlan.items.length} items planned</small>
            <ArrowRight size={18} />
          </Link>
          <div>
            <span>Estimated jars</span>
            <strong>{(totals?.jars.halfPint || 0) + (totals?.jars.pint || 0) + (totals?.jars.quart || 0) + (totals?.jars.any || 0)}</strong>
          </div>
          <div>
            <span>Freezer bags</span>
            <strong>{totals?.freezerBags || 0}</strong>
          </div>
          <div>
            <span>Sessions</span>
            <strong>{latestPlan.sessions.length}</strong>
          </div>
        </section>
      ) : null}

      {pantry.products.length ? (
        <section className="summary-strip" aria-label="Pantry summary">
          <Link to="/pantry" className="summary-main">
            <span>Pantry</span>
            <strong>{pantry.products.length}</strong>
            <small>{pantry.batches.length} batches tracked</small>
            <ArrowRight size={18} />
          </Link>
          <div>
            <span>Locations</span>
            <strong>{pantry.locations.filter((location) => pantry.batches.some((batch) => batch.locationId === location.id)).length}</strong>
          </div>
          <div>
            <span>Low stock</span>
            <strong>{lowStock}</strong>
          </div>
          <div>
            <span>Use soon</span>
            <strong>{useSoon}</strong>
          </div>
        </section>
      ) : null}

      {animals.groups.length || animals.individuals.length || animals.events.length ? (
        <section className="summary-strip" aria-label="Animals summary">
          <Link to="/animals" className="summary-main">
            <span>Animals</span>
            <strong>{activeAnimalGroups + activeAnimalIndividuals}</strong>
            <small>Active groups and individuals</small>
            <ArrowRight size={18} />
          </Link>
          <div>
            <span>Groups</span>
            <strong>{activeAnimalGroups}</strong>
          </div>
          <div>
            <span>Care due</span>
            <strong>{animalCareDue}</strong>
          </div>
          <div>
            <span>Events</span>
            <strong>{animals.events.length}</strong>
          </div>
        </section>
      ) : null}

      {chores.members.length || chores.chores.length || chores.completions.length ? (
        <section className="summary-strip" aria-label="Chores summary">
          <Link to="/chores" className="summary-main">
            <span>Chores</span>
            <strong>{choreDueToday}</strong>
            <small>Due today</small>
            <ArrowRight size={18} />
          </Link>
          <div>
            <span>Getting ripe</span>
            <strong>{ripeChores}</strong>
          </div>
          <div>
            <span>By-person load</span>
            <strong>{choreLoad}</strong>
          </div>
          <div>
            <span>Seasonal soon</span>
            <strong>{upcomingSeasonChores}</strong>
          </div>
        </section>
      ) : (
        <section className="summary-strip" aria-label="Chores summary">
          <Link to="/chores" className="summary-main">
            <span>Chores</span>
            <strong>Active</strong>
            <small>Add people, then the work</small>
            <ArrowRight size={18} />
          </Link>
          <div>
            <span>Fixed</span>
            <strong>Daily</strong>
          </div>
          <div>
            <span>Decay</span>
            <strong>Ripe</strong>
          </div>
          <div>
            <span>Season</span>
            <strong>Frost</strong>
          </div>
        </section>
      )}

      <section className="page-section" aria-labelledby="module-heading">
        <div className="section-heading">
          <p className="eyebrow">Homestead map</p>
          <h2 id="module-heading">Modules</h2>
        </div>
        <div className="module-grid">
          {rootcellarModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>
    </div>
  );
}
