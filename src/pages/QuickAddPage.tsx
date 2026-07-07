import { ClipboardCheck, ClipboardList, Package, PawPrint, Sprout, UserPlus, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../shared/components/PageHeader";

const QUICK_ADD_LINKS = [
  { to: "/chores/new", label: "Add a chore", hint: "Give the work an owner.", icon: ClipboardCheck },
  { to: "/chores/members", label: "Add a household member", hint: "Names and roles for who carries what.", icon: UserPlus },
  { to: "/pantry/products/new", label: "Add a pantry product", hint: "What's put away.", icon: Package },
  { to: "/pantry/batches/new", label: "Log a pantry batch", hint: "A jar, bag, or bin on the shelf.", icon: Package },
  { to: "/garden/beds", label: "Add a garden bed", hint: "Where things grow.", icon: Sprout },
  { to: "/garden/plantings/new", label: "Add a planting", hint: "What's in the ground.", icon: Sprout },
  { to: "/animals/groups/new", label: "Add an animal group", hint: "A flock, herd, or hive.", icon: PawPrint },
  { to: "/preservation/new", label: "Start a preservation plan", hint: "Plan the jars before harvest.", icon: ClipboardList },
  { to: "/daily-bread", label: "Add owned work for today", hint: "Something to carry right now.", icon: Wheat },
];

export function QuickAddPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Add" title="Put something in the cellar">
        <p>Pick what you're adding. Everything lands in the room it belongs to.</p>
      </PageHeader>
      <div className="quick-add-grid">
        {QUICK_ADD_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link className="quick-add-card" to={link.to} key={link.to}>
              <Icon size={22} aria-hidden="true" />
              <div>
                <strong>{link.label}</strong>
                <span>{link.hint}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
