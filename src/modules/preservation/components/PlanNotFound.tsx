import { ArrowLeft } from "lucide-react";
import { LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";

export function PlanNotFound() {
  return (
    <div className="page-stack">
      <PageHeader title="Plan not found">
        <p>This preservation plan is not stored in this browser.</p>
      </PageHeader>
      <LinkButton to="/preservation" variant="secondary">
        <ArrowLeft size={18} />
        Preservation
      </LinkButton>
    </div>
  );
}
