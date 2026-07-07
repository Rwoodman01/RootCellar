import { HandHeart, Home, Plus, Settings, Wheat } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { roomModules } from "../../moduleRegistry";
import { BrandMark } from "./BrandMark";

const bottomNav = [
  { name: "Today", path: "/daily-bread", icon: Wheat },
  { name: "Homestead", path: "/homestead", icon: Home },
  { name: "Huddle", path: "/huddle", icon: HandHeart },
  { name: "Add", path: "/add", icon: Plus },
];

function isHomesteadActive(pathname: string): boolean {
  return pathname === "/homestead" || roomModules.some((module) => pathname.startsWith(module.path));
}

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
          <NavLink to="/daily-bread" className={({ isActive }) => (isActive ? "active" : undefined)}>
            <Wheat size={19} aria-hidden="true" />
            <span>Today</span>
          </NavLink>
          <NavLink to="/homestead" className={isHomesteadActive(location.pathname) ? "active" : undefined}>
            <Home size={19} aria-hidden="true" />
            <span>Homestead</span>
          </NavLink>
          <div className="side-nav-sub">
            {roomModules.map((module) => {
              const Icon = module.icon;
              return (
                <NavLink key={module.path} to={module.path} className={({ isActive }) => (isActive ? "active" : undefined)}>
                  <Icon size={17} aria-hidden="true" />
                  <span>{module.name}</span>
                </NavLink>
              );
            })}
          </div>
          <NavLink to="/huddle" className={({ isActive }) => (isActive ? "active" : undefined)}>
            <HandHeart size={19} aria-hidden="true" />
            <span>Huddle</span>
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => (isActive ? "active" : undefined)}>
            <Plus size={19} aria-hidden="true" />
            <span>Add</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : undefined)}>
            <Settings size={19} aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
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
          const isActive = item.path === "/homestead" ? isHomesteadActive(location.pathname) : location.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={item.path} className={isActive ? "active" : undefined}>
              <Icon size={19} aria-hidden="true" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
