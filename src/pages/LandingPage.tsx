import { ArrowRight, HandHeart, Home, Settings, Wheat } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { rootcellarModules } from "../moduleRegistry";
import { BrandMark } from "../shared/components/BrandMark";
import { Button, LinkButton } from "../shared/components/Button";
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
  const hasOnboarded = Boolean(profile.onboardingCompletedAt);

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
    navigate("/dashboard");
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
    navigate("/dashboard");
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
            {hasOnboarded ? (
              <>
                <p className="eyebrow">Rootcellar Alpha</p>
                <h1>{profile.householdName} finally remembers.</h1>
                <p>
                  Pick up today’s work, review the household board, or gather the week around the table.
                  {profile.locationLabel ? ` Set for ${profile.locationLabel}.` : ""}
                </p>
                <div className="landing-actions">
                  <LinkButton to="/daily-bread">
                    <Wheat size={18} />
                    Daily Bread
                  </LinkButton>
                  <LinkButton to="/dashboard" variant="secondary">
                    <Home size={18} />
                    Dashboard
                  </LinkButton>
                  <LinkButton to="/huddle" variant="secondary">
                    <HandHeart size={18} />
                    Weekly Huddle
                  </LinkButton>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          <div className="season-panel opening-panel" aria-label="Rootcellar first steps">
            <span>{hasOnboarded ? focusLabel(profile.startFocus) : "First steps"}</span>
            <h2>{hasOnboarded ? "Daily Bread carries today. Weekly Huddle decides what carries next." : "Set the household, open Daily Bread, then add one real thing that needs carrying."}</h2>
            <Link to={hasOnboarded ? "/daily-bread" : "/dashboard"}>
              {hasOnboarded ? "Open Daily Bread" : "Open the dashboard"}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="landing-modules" aria-labelledby="module-heading">
          <div className="section-heading">
            <p className="eyebrow">App foundation</p>
            <h2 id="module-heading">The V1 rooms are focused.</h2>
          </div>
          <div className="module-grid">
            {rootcellarModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function focusLabel(value: RootcellarStartFocus): string {
  return focusOptions.find((option) => option.value === value)?.label || "Daily rhythm";
}
