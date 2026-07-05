import { ArrowLeft, Download, Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import { LinkButton, Button } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { ESTIMATE_DISCLAIMER, productLabel } from "../constants";
import { PlanNotFound } from "../components/PlanNotFound";
import { ShoppingListSummary } from "../components/ShoppingListSummary";
import { downloadPlan } from "../download";
import { estimateItem, estimatePlan } from "../estimates";
import { usePreservationPlan } from "../usePreservationPlans";

export function ShoppingListPage() {
  const { planId } = useParams();
  const plan = usePreservationPlan(planId);

  if (!plan) {
    return <PlanNotFound />;
  }

  const totals = estimatePlan(plan.items);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={plan.title}
        title="Shopping list"
        actions={
          <>
            <LinkButton to={`/preservation/${plan.id}`} variant="secondary">
              <ArrowLeft size={18} />
              Plan
            </LinkButton>
            <LinkButton to={`/preservation/${plan.id}/print`} variant="secondary">
              <Printer size={18} />
              Print
            </LinkButton>
          </>
        }
      >
        <p>Totals are rolled up from the preservation items in this plan.</p>
      </PageHeader>

      <ShoppingListSummary totals={totals} />
      <p className="disclaimer">{ESTIMATE_DISCLAIMER}</p>

      <section className="page-section">
        <div className="section-heading">
          <p className="eyebrow">By item</p>
          <h2>Where the numbers come from</h2>
        </div>
        <div className="assumption-list">
          {plan.items.map((item) => {
            const estimate = estimateItem(item);
            return (
              <article key={item.id}>
                <h3>{productLabel(item.productType, item.customName)}</h3>
                <ul>
                  {estimate.assumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="toolbar-row">
        <Button type="button" variant="secondary" onClick={() => downloadPlan(plan)}>
          <Download size={18} />
          Export JSON
        </Button>
      </section>
    </div>
  );
}
