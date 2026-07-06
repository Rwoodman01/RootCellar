import { AlertTriangle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { rootcellarRooms } from "../moduleRegistry";
import { LinkButton } from "../shared/components/Button";
import { PageHeader } from "../shared/components/PageHeader";
import { usePreservationPlans } from "../modules/preservation/usePreservationPlans";
import { usePantry } from "../modules/pantry/usePantry";
import { useAnimals } from "../modules/animals/useAnimals";
import { activeGroups, activeIndividuals, dueCareReminders } from "../modules/animals/animalUtils";
import { useChores } from "../modules/chores/useChores";
import { getTodayChores } from "../modules/chores/choreUtils";
import { useGarden } from "../modules/garden/useGarden";
import { useHuddle } from "../modules/huddle/useHuddle";

export function HomesteadPage() {
  const { plans } = usePreservationPlans();
  const { data: pantry } = usePantry();
  const { data: animals } = useAnimals();
  const { data: chores } = useChores();
  const { data: garden } = useGarden();
  const huddle = useHuddle();

  const openStuck = huddle.data.stuckItems.filter((item) => item.status === "open" || item.status === "carried").length;

  const roomFacts: Record<string, string> = {
    preservation: plans.length ? `${plans.length} plan${plans.length === 1 ? "" : "s"}` : "No plans yet",
    pantry: pantry.products.length ? `${pantry.products.length} product${pantry.products.length === 1 ? "" : "s"}` : "Empty so far",
    garden: garden.plantings.length ? `${garden.plantings.length} planting${garden.plantings.length === 1 ? "" : "s"}` : "No plantings yet",
    animals: (() => {
      const count = activeGroups(animals.groups).length + activeIndividuals(animals.individuals).length;
      return count ? `${count} active` : "None added yet";
    })(),
    chores: (() => {
      const due = getTodayChores(chores).length;
      return due ? `${due} due today` : "Nothing due today";
    })(),
  };

  const animalCareDue = dueCareReminders(animals.careReminders).length;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Homestead"
        title="The rooms"
        actions={
          <LinkButton to="/settings" variant="secondary">
            <Settings size={18} />
            Settings
          </LinkButton>
        }
      >
        <p>Everything here stays local to this browser.</p>
      </PageHeader>

      {openStuck || animalCareDue ? (
        <section className="homestead-attention" aria-label="Needs attention">
          <AlertTriangle size={18} />
          <span>
            {openStuck ? `${openStuck} item${openStuck === 1 ? "" : "s"} on the stuck list` : ""}
            {openStuck && animalCareDue ? " · " : ""}
            {animalCareDue ? `${animalCareDue} care reminder${animalCareDue === 1 ? "" : "s"} due` : ""}
          </span>
        </section>
      ) : null}

      <section className="homestead-room-grid" aria-label="Rooms">
        {rootcellarRooms.map((room) => {
          const Icon = room.icon;
          return (
            <Link className="homestead-room-card" to={room.path} key={room.id}>
              <Icon size={22} aria-hidden="true" />
              <div>
                <strong>{room.name}</strong>
                <span>{roomFacts[room.id]}</span>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
