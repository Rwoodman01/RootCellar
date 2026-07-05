import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { rootcellarModules } from "../moduleRegistry";
import { LinkButton } from "../shared/components/Button";
import { PageHeader } from "../shared/components/PageHeader";

export function ComingSoonPage({ moduleId }: { moduleId: string }) {
  const module = rootcellarModules.find((item) => item.id === moduleId);
  const Icon = module?.icon;

  if (!module) {
    return (
      <div className="page-stack">
        <PageHeader title="Module not found" />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Coming soon"
        title={module.name}
        actions={
          <LinkButton to="/dashboard" variant="secondary">
            <ArrowLeft size={18} />
            Dashboard
          </LinkButton>
        }
      >
        <p>{module.promise}</p>
      </PageHeader>

      <section className="coming-soon-panel">
        {Icon ? (
          <div className="large-icon" aria-hidden="true">
            <Icon size={34} />
          </div>
        ) : null}
        <h2>Not built yet</h2>
        <p>
          This route is part of the Rootcellar V1 map, but this room is not built yet.
        </p>
        <Link to="/dashboard">Open the dashboard</Link>
      </section>
    </div>
  );
}
