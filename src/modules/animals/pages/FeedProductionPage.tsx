import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { AnimalTargetSelect } from "../components/AnimalTargetSelect";
import { PRODUCTION_DESTINATION_OPTIONS, PRODUCTION_TYPE_OPTIONS, productionDestinationLabel, productionTypeLabel } from "../constants";
import { feedSummary, productionSummary, sortedFeedRecords, sortedProductionRecords, targetLabel, todayDate } from "../animalUtils";
import type { FeedRecordInput, ProductionDestination, ProductionRecordInput, ProductionType } from "../types";
import { useAnimals } from "../useAnimals";

export function FeedProductionPage() {
  const { data, addFeedRecord, addProductionRecord } = useAnimals();
  const [searchParams] = useSearchParams();
  const initialTarget = { groupId: searchParams.get("groupId") || undefined, animalId: searchParams.get("animalId") || undefined };
  const [feedForm, setFeedForm] = useState<FeedRecordInput>({
    ...initialTarget,
    feedType: "",
    amount: 1,
    unit: "lb",
    date: todayDate(),
    cost: undefined,
    notes: "",
  });
  const [productionForm, setProductionForm] = useState<ProductionRecordInput>({
    ...initialTarget,
    productionType: "eggs",
    quantity: 1,
    unit: "eggs",
    date: todayDate(),
    destination: "fresh use",
    notes: "",
  });
  const hasTargets = data.groups.length > 0 || data.individuals.length > 0;

  const submitFeed = (event: FormEvent) => {
    event.preventDefault();
    if (!feedForm.groupId && !feedForm.animalId) return;
    addFeedRecord(feedForm);
    setFeedForm((current) => ({ ...current, feedType: "", amount: 1, cost: undefined, notes: "" }));
  };

  const submitProduction = (event: FormEvent) => {
    event.preventDefault();
    if (!productionForm.groupId && !productionForm.animalId) return;
    addProductionRecord(productionForm);
    setProductionForm((current) => ({ ...current, quantity: 1, notes: "" }));
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Feed and production" title="Simple logs without farm accounting">
        <p>Track what you fed and what came in: eggs, milk, meat, fiber, honey, and other household-scale production.</p>
      </PageHeader>

      {!hasTargets ? (
        <EmptyState
          title="Add a group or animal first"
          action={
            <LinkButton to="/animals/groups/new">
              <Plus size={18} />
              Add animal group
            </LinkButton>
          }
        >
          Feed and production records need a group or individual animal to attach to.
        </EmptyState>
      ) : (
        <>
          <section className="animal-dashboard-grid">
            <form className="form-panel" onSubmit={submitFeed}>
              <div className="section-heading">
                <p className="eyebrow">Feed log</p>
                <h2>Add feed record</h2>
              </div>
              <AnimalTargetSelect
                data={data}
                groupId={feedForm.groupId}
                animalId={feedForm.animalId}
                onChange={(target) => setFeedForm((current) => ({ ...current, groupId: target.groupId, animalId: target.animalId }))}
                required
              />
              <div className="form-grid">
                <label>
                  Feed type
                  <input value={feedForm.feedType} onChange={(event) => setFeedForm({ ...feedForm, feedType: event.target.value })} required placeholder="Layer pellets, hay, minerals" />
                </label>
                <label>
                  Date
                  <input type="date" value={feedForm.date} onChange={(event) => setFeedForm({ ...feedForm, date: event.target.value })} required />
                </label>
                <label>
                  Amount
                  <input type="number" min="0" step="0.1" value={feedForm.amount} onChange={(event) => setFeedForm({ ...feedForm, amount: Number(event.target.value) })} />
                </label>
                <label>
                  Unit
                  <input value={feedForm.unit} onChange={(event) => setFeedForm({ ...feedForm, unit: event.target.value })} placeholder="lb, flakes, scoops" />
                </label>
                <label>
                  Cost, optional
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={feedForm.cost ?? ""}
                    onChange={(event) => setFeedForm({ ...feedForm, cost: event.target.value === "" ? undefined : Number(event.target.value) })}
                    placeholder="36.50"
                  />
                </label>
              </div>
              <label>
                Notes
                <textarea rows={3} value={feedForm.notes} onChange={(event) => setFeedForm({ ...feedForm, notes: event.target.value })} />
              </label>
              <Button type="submit">
                <Plus size={18} />
                Add feed
              </Button>
            </form>

            <form className="form-panel" onSubmit={submitProduction}>
              <div className="section-heading">
                <p className="eyebrow">Production log</p>
                <h2>Add production record</h2>
              </div>
              <AnimalTargetSelect
                data={data}
                groupId={productionForm.groupId}
                animalId={productionForm.animalId}
                onChange={(target) => setProductionForm((current) => ({ ...current, groupId: target.groupId, animalId: target.animalId }))}
                required
              />
              <div className="form-grid">
                <label>
                  Production type
                  <select value={productionForm.productionType} onChange={(event) => setProductionForm({ ...productionForm, productionType: event.target.value as ProductionType })}>
                    {PRODUCTION_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Date
                  <input type="date" value={productionForm.date} onChange={(event) => setProductionForm({ ...productionForm, date: event.target.value })} required />
                </label>
                <label>
                  Quantity
                  <input type="number" min="0" step="0.1" value={productionForm.quantity} onChange={(event) => setProductionForm({ ...productionForm, quantity: Number(event.target.value) })} />
                </label>
                <label>
                  Unit
                  <input value={productionForm.unit} onChange={(event) => setProductionForm({ ...productionForm, unit: event.target.value })} placeholder="eggs, gallons, lb" />
                </label>
                <label>
                  Destination
                  <select value={productionForm.destination} onChange={(event) => setProductionForm({ ...productionForm, destination: event.target.value as ProductionDestination })}>
                    {PRODUCTION_DESTINATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Notes
                <textarea rows={3} value={productionForm.notes} onChange={(event) => setProductionForm({ ...productionForm, notes: event.target.value })} />
              </label>
              <Button type="submit">
                <Plus size={18} />
                Add production
              </Button>
            </form>
          </section>

          <section className="animal-dashboard-grid">
            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Feed records</p>
                <h2>Recent feed</h2>
              </div>
              <div className="compact-list">
                {sortedFeedRecords(data.feedRecords)
                  .slice(0, 8)
                  .map((record) => (
                    <div className="compact-row" key={record.id}>
                      <strong>{feedSummary(record)}</strong>
                      <span>{targetLabel(data, record)}</span>
                      <small>{formatShortDate(record.date)}</small>
                    </div>
                  ))}
                {data.feedRecords.length === 0 ? <p className="muted">No feed records yet.</p> : null}
              </div>
            </div>

            <div className="pantry-panel">
              <div className="section-heading">
                <p className="eyebrow">Production records</p>
                <h2>Recent output</h2>
              </div>
              <div className="compact-list">
                {sortedProductionRecords(data.productionRecords)
                  .slice(0, 8)
                  .map((record) => (
                    <div className="compact-row" key={record.id}>
                      <strong>{productionSummary(record)}</strong>
                      <span>
                        {targetLabel(data, record)} - {productionTypeLabel(record.productionType)} to {productionDestinationLabel(record.destination)}
                      </span>
                      <small>{formatShortDate(record.date)}</small>
                    </div>
                  ))}
                {data.productionRecords.length === 0 ? <p className="muted">No production records yet.</p> : null}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
