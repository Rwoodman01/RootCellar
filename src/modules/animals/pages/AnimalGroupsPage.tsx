import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { purposeLabel, statusLabel } from "../constants";
import { useAnimals } from "../useAnimals";

export function AnimalGroupsPage() {
  const { data } = useAnimals();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Animal groups"
        title="Flocks, herds, colonies, batches, and yards"
        actions={
          <LinkButton to="/animals/groups/new">
            <Plus size={18} />
            Add group
          </LinkButton>
        }
      >
        <p>Use groups when the memory belongs to the whole flock or herd instead of one named animal.</p>
      </PageHeader>

      {data.groups.length === 0 ? (
        <EmptyState
          title="No animal groups yet"
          action={
            <LinkButton to="/animals/groups/new">
              <Plus size={18} />
              Add animal group
            </LinkButton>
          }
        >
          Laying flock, meat birds, goat herd, rabbit colony, bee yard, or any group you care for together.
        </EmptyState>
      ) : (
        <section className="plan-list">
          {data.groups.map((group) => (
            <article className="plan-row" key={group.id}>
              <Link to={`/animals/groups/${group.id}`}>
                <span>
                  {group.species} - {purposeLabel(group.purpose)}
                </span>
                <strong>{group.name}</strong>
                <small>
                  {group.count} animals - {statusLabel(group.status)} - Started {formatShortDate(group.startDate)}
                  {group.location ? ` - ${group.location}` : ""}
                </small>
                <ArrowRight size={18} />
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

