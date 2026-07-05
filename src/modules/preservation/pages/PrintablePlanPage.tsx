import { ArrowLeft, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { formatShortDate } from "../../../shared/utils/dates";
import { ESTIMATE_DISCLAIMER, methodLabel, productLabel, unitLabel } from "../constants";
import { PlanNotFound } from "../components/PlanNotFound";
import { ShoppingListSummary } from "../components/ShoppingListSummary";
import { estimateItem, estimatePlan } from "../estimates";
import { usePreservationPlan } from "../usePreservationPlans";

export function PrintablePlanPage() {
  const { planId } = useParams();
  const plan = usePreservationPlan(planId);

  if (!plan) {
    return <PlanNotFound />;
  }

  const totals = estimatePlan(plan.items);

  return (
    <main className="print-page">
      <div className="print-actions">
        <Link className="button button-secondary" to={`/preservation/${plan.id}`}>
          <ArrowLeft size={18} />
          Back to plan
        </Link>
        <Button type="button" onClick={() => window.print()}>
          <Printer size={18} />
          Print / save PDF
        </Button>
      </div>

      <header className="print-header">
        <img src="/rootcellar-mark.svg" alt="" />
        <div>
          <span>Rootcellar Preservation Plan</span>
          <h1>{plan.title}</h1>
          <p>
            {plan.householdName} · {plan.seasonYear}
          </p>
        </div>
      </header>

      {plan.notes ? <p className="print-notes">{plan.notes}</p> : null}

      <section>
        <h2>Shopping list</h2>
        <ShoppingListSummary totals={totals} />
      </section>

      <section>
        <h2>Preservation items</h2>
        <div className="print-table">
          <div className="print-table-row print-table-head">
            <span>Item</span>
            <span>Method</span>
            <span>Target</span>
            <span>Estimated needs</span>
          </div>
          {plan.items.map((item) => {
            const estimate = estimateItem(item);
            const needs = [
              estimate.jarCounts.halfPint ? `${estimate.jarCounts.halfPint} half-pints` : "",
              estimate.jarCounts.pint ? `${estimate.jarCounts.pint} pints` : "",
              estimate.jarCounts.quart ? `${estimate.jarCounts.quart} quarts` : "",
              estimate.freezerBags ? `${estimate.freezerBags} freezer bags` : "",
              estimate.producePounds ? `${estimate.producePounds} lb produce` : "",
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <div className="print-table-row" key={item.id}>
                <span>{productLabel(item.productType, item.customName)}</span>
                <span>{methodLabel(item.method)}</span>
                <span>
                  {item.targetQuantity} {unitLabel(item.unit)}
                </span>
                <span>{needs || "Estimate pending"}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Kitchen sessions</h2>
        {plan.sessions.length ? (
          <div className="print-session-list">
            {plan.sessions.map((session) => (
              <article key={session.id}>
                <h3>{session.title}</h3>
                <p>{formatShortDate(session.date)}</p>
                <p>
                  {session.itemIds
                    .map((itemId) => {
                      const item = plan.items.find((entry) => entry.id === itemId);
                      return item ? productLabel(item.productType, item.customName) : "Removed item";
                    })
                    .join(", ") || "No items assigned"}
                </p>
                {session.notes ? <small>{session.notes}</small> : null}
              </article>
            ))}
          </div>
        ) : (
          <p>No kitchen sessions planned yet.</p>
        )}
      </section>

      <section>
        <h2>Assumptions</h2>
        {plan.items.map((item) => {
          const estimate = estimateItem(item);
          return (
            <article className="print-assumptions" key={item.id}>
              <h3>{productLabel(item.productType, item.customName)}</h3>
              <ul>
                {estimate.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <p className="disclaimer">{ESTIMATE_DISCLAIMER}</p>
    </main>
  );
}
