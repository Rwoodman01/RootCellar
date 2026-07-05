import type { ShoppingListTotals } from "../types";

interface ShoppingListSummaryProps {
  totals: ShoppingListTotals;
}

function supplyEntries(supplies: Record<string, number>) {
  return Object.entries(supplies)
    .filter(([, amount]) => amount > 0)
    .sort(([a], [b]) => a.localeCompare(b));
}

export function ShoppingListSummary({ totals }: ShoppingListSummaryProps) {
  const jars = [
    ["Half-pint jars", totals.jars.halfPint],
    ["Pint jars", totals.jars.pint],
    ["Quart jars", totals.jars.quart],
    ["Flexible jars", totals.jars.any],
  ].filter(([, amount]) => Number(amount) > 0);

  const supplies = supplyEntries(totals.supplies);

  return (
    <div className="shopping-grid">
      <section className="shopping-card">
        <h2>Jars and lids</h2>
        <ul className="shopping-list">
          {jars.length ? (
            jars.map(([name, amount]) => (
              <li key={name}>
                <span>{name}</span>
                <strong>{amount}</strong>
              </li>
            ))
          ) : (
            <li>
              <span>No canning jars estimated yet</span>
              <strong>0</strong>
            </li>
          )}
          <li>
            <span>Regular lids</span>
            <strong>{totals.lids.regular}</strong>
          </li>
          <li>
            <span>Wide-mouth lids</span>
            <strong>{totals.lids.wideMouth}</strong>
          </li>
        </ul>
      </section>

      <section className="shopping-card">
        <h2>Freezer and storage</h2>
        <ul className="shopping-list">
          <li>
            <span>Freezer bags</span>
            <strong>{totals.freezerBags}</strong>
          </li>
          <li>
            <span>Freezer quarts</span>
            <strong>{totals.freezerQuarts}</strong>
          </li>
          <li>
            <span>Dehydrated storage pints</span>
            <strong>{totals.dehydratedPints}</strong>
          </li>
          <li>
            <span>Fermentation quarts</span>
            <strong>{totals.fermentationQuarts}</strong>
          </li>
        </ul>
      </section>

      <section className="shopping-card">
        <h2>Produce and pantry supplies</h2>
        <ul className="shopping-list">
          <li>
            <span>Estimated produce pounds</span>
            <strong>{totals.producePounds}</strong>
          </li>
          {supplies.length ? (
            supplies.map(([name, amount]) => (
              <li key={name}>
                <span>{name}</span>
                <strong>{amount}</strong>
              </li>
            ))
          ) : (
            <li>
              <span>Extra supplies</span>
              <strong>0</strong>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
