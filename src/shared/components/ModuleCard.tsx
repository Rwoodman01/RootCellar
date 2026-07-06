import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { RootcellarModule } from "../types/modules";

export function ModuleCard({ module }: { module: RootcellarModule }) {
  const Icon = module.icon;

  return (
    <Link className={`module-card module-card-${module.status}`} to={module.path}>
      <div className="module-card-icon" aria-hidden="true">
        <Icon size={22} />
      </div>
      <div>
        <h2>{module.name}</h2>
      </div>
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}
