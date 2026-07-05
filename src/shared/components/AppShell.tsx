import { ClipboardCheck, ClipboardList, HandHeart, Home, Package, PawPrint, Settings, Sprout, Wheat } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { rootcellarModules } from "../../moduleRegistry";
import { BrandMark } from "./BrandMark";

const primaryNav = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  ...rootcellarModules,
  { name: "Settings", path: "/settings", icon: Settings },
];

const bottomNav = [
  { name: "Home", path: "/dashboard", icon: Home },
  { name: "Daily", path: "/daily-bread", icon: Wheat },
  { name: "Preserve", path: "/preservation", icon: ClipboardList },
  { name: "Pantry", path: "/pantry", icon: Package },
  { name: "Garden", path: "/garden", icon: Sprout },
  { name: "Animals", path: "/animals", icon: PawPrint },
  { name: "Chores", path: "/chores", icon: ClipboardCheck },
  { name: "Huddle", path: "/huddle", icon: HandHeart },
];

export function AppShell() {
  const location = useLocation();
  const isPrint = location.pathname.includes("/print");

  if (isPrint) {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      <aside className="side-rail" aria-label="Main navigation">
        <BrandMark />
        <nav className="side-nav">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? "active" : undefined)}>
                <Icon size={19} aria-hidden="true" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="main-frame">
        <header className="mobile-topbar">
          <BrandMark />
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Main navigation">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? "active" : undefined)}>
              <Icon size={19} aria-hidden="true" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
