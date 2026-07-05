import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../shared/components/EmptyState";
import { LinkButton, Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { estimatePlan } from "../estimates";
import { usePreservationPlans } from "../usePreservationPlans";

export function PreservationListPage() {
  const { plans, deletePlan } = usePreservationPlans();

  const handleDelete = (planId: string, title: string) => {
    const confirmed = window.confirm(`Delete "${title}" from this browser?`);
    if (!confirmed) return;
    deletePlan(planId);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Preservation"
        title="Canning season, before it gets loud"
        actions={
          <LinkButton to="/preservation/new">
            <Plus size={18} />
            New plan
          </LinkButton>
        }
      >
        <p>Beat the August Ambush. Plan jars, freezer space, and kitchen sessions before harvest takes over.</p>
      </PageHeader>

      {plans.length === 0 ? (
        <EmptyState
          title="No preservation plans yet"
          action={
            <LinkButton to="/preservation/new">
              <Plus size={18} />
              Start a plan
            </LinkButton>
          }
        >
          Create a season plan, add items, and Rootcellar will keep the estimated supplies in one place.
        </EmptyState>
      ) : (
        <section className="plan-list" aria-label="Preservation plans">
          {plans.map((plan) => {
            const totals = estimatePlan(plan.items);
            const jarTotal = totals.jars.halfPint + totals.jars.pint + totals.jars.quart + totals.jars.any;

            return (
              <article className="plan-row" key={plan.id}>
                <Link to={`/preservation/${plan.id}`}>
                  <span>{plan.seasonYear}</span>
                  <strong>{plan.title}</strong>
                  <small>
                    {plan.items.length} items · {jarTotal} jars · {totals.freezerBags} freezer bags · updated{" "}
                    {formatShortDate(plan.updatedAt.slice(0, 10))}
                  </small>
                  <ArrowRight size={18} />
                </Link>
                <Button type="button" variant="ghost" onClick={() => handleDelete(plan.id, plan.title)} aria-label={`Delete ${plan.title}`}>
                  <Trash2 size={18} />
                </Button>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
