import { ClipboardCheck, HandHeart, Home, Package, PawPrint, Plus, Settings, Sprout, Wheat, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { rootcellarRooms } from "../../moduleRegistry";
import { BrandMark } from "./BrandMark";

const primaryNav = [
  { name: "Today", path: "/daily-bread", icon: Wheat },
  { name: "Homestead", path: "/homestead", icon: Home },
  { name: "Huddle", path: "/huddle", icon: HandHeart },
];

const bottomNav = [
  { name: "Today", path: "/daily-bread", icon: Wheat },
  { name: "Homestead", path: "/homestead", icon: Home },
  { name: "Huddle", path: "/huddle", icon: HandHeart },
];

const addSheetItems = [
  { name: "Log harvest", path: "/garden/harvests", icon: Sprout },
  { name: "Add to pantry", path: "/pantry/batches/new", icon: Package },
  { name: "Log animal event", path: "/animals/quick-log", icon: PawPrint },
  { name: "Add work", path: "/daily-bread", icon: ClipboardCheck },
];

export function AppShell() {
  const location = useLocation();
  const isPrint = location.pathname.includes("/print");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setAddOpen(false);
  }, [location.pathname]);

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
          <div className="side-nav-sub">
            {rootcellarRooms.map((room) => {
              const Icon = room.icon;
              return (
                <NavLink key={room.path} to={room.path} className={({ isActive }) => (isActive ? "active" : undefined)}>
                  <Icon size={17} aria-hidden="true" />
                  <span>{room.name}</span>
                </NavLink>
              );
            })}
          </div>
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

      {addOpen ? (
        <div className="add-sheet-overlay" role="dialog" aria-label="Add something">
          <button type="button" className="add-sheet-backdrop" aria-label="Close" onClick={() => setAddOpen(false)} />
          <div className="add-sheet">
            <div className="add-sheet-heading">
              <span>Add something</span>
              <button type="button" className="icon-button button-ghost" onClick={() => setAddOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {addSheetItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} className="add-sheet-item" onClick={() => setAddOpen(false)}>
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

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
        <button type="button" className={addOpen ? "active" : undefined} onClick={() => setAddOpen((current) => !current)}>
          <Plus size={19} aria-hidden="true" />
          <span>Add</span>
        </button>
      </nav>
    </div>
  );
}
