import { ArrowRight, Settings } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { rootcellarRooms } from "../moduleRegistry";
import { BrandMark } from "../shared/components/BrandMark";
import { Button } from "../shared/components/Button";
import { ModuleCard } from "../shared/components/ModuleCard";
import { loadRootcellarData, saveRootcellarData, type RootcellarStartFocus } from "../shared/storage/rootcellarStorage";

const focusOptions: Array<{ value: RootcellarStartFocus; label: string }> = [
  { value: "daily-rhythm", label: "Daily rhythm" },
  { value: "food-stores", label: "Food stores" },
  { value: "garden", label: "Garden" },
  { value: "animals", label: "Animals" },
  { value: "chores", label: "Chores" },
  { value: "preservation", label: "Preservation" },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState(() => loadRootcellarData());
  const profile = localData.householdProfile;
  const [form, setForm] = useState({
    householdName: profile.householdName === "Our household" ? "" : profile.householdName,
    locationLabel: profile.locationLabel,
    startFocus: profile.startFocus,
  });

  if (profile.onboardingCompletedAt) {
    return <Navigate to="/daily-bread" replace />;
  }

  function saveOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const nextData = {
      ...loadRootcellarData(),
      householdProfile: {
        ...profile,
        householdName: form.householdName.trim() || "Our household",
        locationLabel: form.locationLabel.trim(),
        startFocus: form.startFocus,
        onboardingCompletedAt: profile.onboardingCompletedAt || now,
        updatedAt: now,
      },
    };
    saveRootcellarData(nextData);
    setLocalData(nextData);
    navigate("/daily-bread");
  }

  function skipOnboarding() {
    const now = new Date().toISOString();
    const nextData = {
      ...loadRootcellarData(),
      householdProfile: {
        ...profile,
        onboardingCompletedAt: profile.onboardingCompletedAt || now,
        updatedAt: now,
      },
    };
    saveRootcellarData(nextData);
    setLocalData(nextData);
    navigate("/daily-bread");
  }

  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <BrandMark />
        <Link to="/settings" aria-label="Settings">
          <Settings size={20} />
        </Link>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-copy">
            <p className="eyebrow">Rootcellar Alpha</p>
            <h1>Your homestead finally remembers.</h1>
            <p>Start with a simple local setup. You can change direction later; this just gives Rootcellar a name for the household and a place to begin.</p>
            <form className="onboarding-form" onSubmit={saveOnboarding}>
              <label>
                Household name
                <input value={form.householdName} onChange={(event) => setForm((current) => ({ ...current, householdName: event.target.value }))} placeholder="Woodman household" />
              </label>
              <label>
                Location or season note
                <input value={form.locationLabel} onChange={(event) => setForm((current) => ({ ...current, locationLabel: event.target.value }))} placeholder="Nova Scotia, Zone 5b, or North field" />
              </label>
              <label>
                What should Rootcellar steady first?
                <select value={form.startFocus} onChange={(event) => setForm((current) => ({ ...current, startFocus: event.target.value as RootcellarStartFocus }))}>
                  {focusOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="landing-actions">
                <Button type="submit">
                  <ArrowRight size={18} />
                  Enter Rootcellar
                </Button>
                <Button type="button" variant="secondary" onClick={skipOnboarding}>
                  Skip for now
                </Button>
              </div>
            </form>
          </div>
          <div className="season-panel opening-panel" aria-label="Rootcellar first steps">
            <span>First steps</span>
            <h2>Set the household, open Daily Bread, then add one real thing that needs carrying.</h2>
          </div>
        </section>

        <section className="landing-modules" aria-labelledby="module-heading">
          <div className="section-heading">
            <p className="eyebrow">App foundation</p>
            <h2 id="module-heading">The V1 rooms are focused.</h2>
          </div>
          <div className="module-grid">
            {rootcellarRooms.map((room) => (
              <ModuleCard key={room.id} module={room} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
