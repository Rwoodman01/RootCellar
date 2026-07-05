import type { PlanEstimate } from "../types";

interface EstimatePillsProps {
  estimate: PlanEstimate;
}

export function EstimatePills({ estimate }: EstimatePillsProps) {
  const pills = [
    { label: "Half-pints", value: estimate.jarCounts.halfPint },
    { label: "Pints", value: estimate.jarCounts.pint },
    { label: "Quarts", value: estimate.jarCounts.quart },
    { label: "Any jars", value: estimate.jarCounts.any },
    { label: "Regular lids", value: estimate.regularLids },
    { label: "Wide lids", value: estimate.wideMouthLids },
    { label: "Freezer bags", value: estimate.freezerBags },
    { label: "Freezer quarts", value: estimate.freezerQuarts },
    { label: "Produce lb", value: estimate.producePounds },
    { label: "Dry pints", value: estimate.dehydratedPints },
    { label: "Ferment quarts", value: estimate.fermentationQuarts },
  ].filter((pill) => pill.value > 0);

  if (pills.length === 0) {
    return <p className="muted">Add a target quantity to see estimates.</p>;
  }

  return (
    <div className="estimate-pills">
      {pills.map((pill) => (
        <span key={pill.label}>
          <strong>{pill.value}</strong>
          {pill.label}
        </span>
      ))}
    </div>
  );
}
