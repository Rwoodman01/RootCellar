import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { purposeLabel, statusLabel } from "../constants";
import { useAnimals } from "../useAnimals";

export function IndividualAnimalsPage() {
  const { data } = useAnimals();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Individual animals"
        title="Named animals, tags, and records worth following alone"
        actions={
          <LinkButton to="/animals/individuals/new">
            <Plus size={18} />
            Add individual
          </LinkButton>
        }
      >
        <p>Use individual records for animals whose care, production, breeding notes, or health history needs its own timeline.</p>
      </PageHeader>

      {data.individuals.length === 0 ? (
        <EmptyState
          title="No individual animals yet"
          action={
            <LinkButton to="/animals/individuals/new">
              <Plus size={18} />
              Add animal
            </LinkButton>
          }
        >
          Clover the goat, Rosie the milk cow, a guardian dog, a breeding buck, or a tagged animal you want to remember clearly.
        </EmptyState>
      ) : (
        <section className="plan-list">
          {data.individuals.map((animal) => {
            const group = data.groups.find((entry) => entry.id === animal.groupId);
            return (
              <article className="plan-row" key={animal.id}>
                <Link to={`/animals/individuals/${animal.id}`}>
                  <span>
                    {animal.species} - {purposeLabel(animal.purpose)}
                  </span>
                  <strong>{animal.name}</strong>
                  <small>
                    {statusLabel(animal.status)}
                    {animal.breed ? ` - ${animal.breed}` : ""}
                    {group ? ` - ${group.name}` : ""}
                    {animal.acquiredDate ? ` - acquired ${formatShortDate(animal.acquiredDate)}` : ""}
                  </small>
                  <ArrowRight size={18} />
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

