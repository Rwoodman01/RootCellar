import { Download, Edit3, Plus, Printer, ShoppingBasket, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { ESTIMATE_DISCLAIMER, methodLabel, productLabel, unitLabel } from "../constants";
import { EstimatePills } from "../components/EstimatePills";
import { PlanNotFound } from "../components/PlanNotFound";
import { SessionForm } from "../components/SessionForm";
import { downloadPlan } from "../download";
import { estimateItem, estimatePlan } from "../estimates";
import { usePreservationPlan, usePreservationPlans } from "../usePreservationPlans";

export function PreservationPlanDetailPage() {
  const { planId } = useParams();
  const plan = usePreservationPlan(planId);
  const { addSession, deleteItem, deleteSession } = usePreservationPlans();

  if (!plan) {
    return <PlanNotFound />;
  }

  const totals = estimatePlan(plan.items);
  const jarTotal = totals.jars.halfPint + totals.jars.pint + totals.jars.quart + totals.jars.any;

  const handleDeleteItem = (itemId: string, name: string) => {
    const confirmed = window.confirm(`Remove "${name}" from this plan?`);
    if (!confirmed) return;
    deleteItem(plan.id, itemId);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${plan.householdName} · ${plan.seasonYear}`}
        title={plan.title}
        actions={
          <>
            <LinkButton to={`/preservation/${plan.id}/shopping-list`} variant="secondary">
              <ShoppingBasket size={18} />
              Shopping list
            </LinkButton>
            <LinkButton to={`/preservation/${plan.id}/print`} variant="secondary">
              <Printer size={18} />
              Print
            </LinkButton>
          </>
        }
      >
        <p>{plan.notes || "A quiet place for jars, freezer space, kitchen days, and the assumptions behind the work."}</p>
      </PageHeader>

      <section className="summary-strip" aria-label="Plan estimates">
        <div>
          <span>Items</span>
          <strong>{plan.items.length}</strong>
        </div>
        <div>
          <span>Estimated jars</span>
          <strong>{jarTotal}</strong>
        </div>
        <div>
          <span>Freezer bags</span>
          <strong>{totals.freezerBags}</strong>
        </div>
        <div>
          <span>Produce pounds</span>
          <strong>{totals.producePounds}</strong>
        </div>
      </section>

      <p className="disclaimer">{ESTIMATE_DISCLAIMER}</p>

      <section className="toolbar-row">
        <LinkButton to={`/preservation/${plan.id}/items/new`}>
          <Plus size={18} />
          Add item
        </LinkButton>
        <LinkButton to={`/preservation/${plan.id}/edit`} variant="secondary">
          <Edit3 size={18} />
          Edit plan
        </LinkButton>
        <Button type="button" variant="secondary" onClick={() => downloadPlan(plan)}>
          <Download size={18} />
          Export JSON
        </Button>
      </section>

      <section className="page-section" aria-labelledby="items-heading">
        <div className="section-heading section-heading-row">
          <div>
            <p className="eyebrow">Preservation items</p>
            <h2 id="items-heading">What you plan to put up</h2>
          </div>
          <Link to={`/preservation/${plan.id}/items/new`}>Add item</Link>
        </div>

        {plan.items.length === 0 ? (
          <EmptyState
            title="Start with the first batch"
            action={
              <LinkButton to={`/preservation/${plan.id}/items/new`}>
                <Plus size={18} />
                Add preservation item
              </LinkButton>
            }
          >
            Add tomatoes, jam, freezer vegetables, stock, or a custom household item.
          </EmptyState>
        ) : (
          <div className="item-list">
            {plan.items.map((item) => {
              const estimate = estimateItem(item);
              const name = productLabel(item.productType, item.customName);

              return (
                <article className="item-card" key={item.id}>
                  <div className="item-card-top">
                    <div>
                      <span>{methodLabel(item.method)}</span>
                      <h3>{name}</h3>
                      <p>
                        Target: {item.targetQuantity} {unitLabel(item.unit)}
                      </p>
                    </div>
                    <div className="item-actions">
                      <Link className="icon-button" to={`/preservation/${plan.id}/items/${item.id}/edit`} aria-label={`Edit ${name}`}>
                        <Edit3 size={17} />
                      </Link>
                      <Button type="button" variant="ghost" className="icon-button" onClick={() => handleDeleteItem(item.id, name)} aria-label={`Remove ${name}`}>
                        <Trash2 size={17} />
                      </Button>
                    </div>
                  </div>
                  <EstimatePills estimate={estimate} />
                  <details>
                    <summary>Produce and prep assumptions</summary>
                    <ul>
                      {estimate.assumptions.map((assumption) => (
                        <li key={assumption}>{assumption}</li>
                      ))}
                    </ul>
                  </details>
                  {item.notes ? <p className="item-note">{item.notes}</p> : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="page-section" aria-labelledby="sessions-heading">
        <div className="section-heading">
          <p className="eyebrow">Session plan</p>
          <h2 id="sessions-heading">Kitchen days</h2>
        </div>

        <SessionForm
          items={plan.items}
          onSubmit={(input) => {
            addSession(plan.id, input);
          }}
        />

        {plan.sessions.length ? (
          <div className="session-list">
            {plan.sessions.map((session) => (
              <article className="session-card" key={session.id}>
                <div>
                  <span>{formatShortDate(session.date)}</span>
                  <h3>{session.title}</h3>
                  <p>
                    {session.itemIds.length
                      ? session.itemIds
                          .map((itemId) => {
                            const item = plan.items.find((entry) => entry.id === itemId);
                            return item ? productLabel(item.productType, item.customName) : "Removed item";
                          })
                          .join(", ")
                      : "No items assigned"}
                  </p>
                  {session.notes ? <small>{session.notes}</small> : null}
                </div>
                <Button type="button" variant="ghost" onClick={() => deleteSession(plan.id, session.id)} aria-label={`Delete ${session.title}`}>
                  <Trash2 size={17} />
                </Button>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
