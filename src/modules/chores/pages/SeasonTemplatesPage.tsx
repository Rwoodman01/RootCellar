import { ArrowLeft, CalendarPlus, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { SEASON_TEMPLATES } from "../constants";
import { useChores } from "../useChores";

export function SeasonTemplatesPage() {
  const { data, updateSettings, addTemplate } = useChores();
  const [settings, setSettings] = useState(data.settings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSettings(data.settings);
  }, [data.settings]);

  const handleSettingsSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateSettings(settings);
    setMessage("Season and condition settings saved.");
  };

  const handleTemplate = (templateId: string) => {
    const count = addTemplate(templateId);
    setMessage(count ? `${count} chore${count === 1 ? "" : "s"} drafted from the template.` : "Add a family member before using templates.");
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Season templates"
        title="Frost anchors, manual conditions, and starter work"
        actions={
          <LinkButton to="/chores" variant="secondary">
            <ArrowLeft size={18} />
            Chores
          </LinkButton>
        }
      >
        <p>V1 uses manual first frost, last frost, custom season dates, and simple condition state. Weather can plug in later without changing chore shape.</p>
      </PageHeader>

      {message ? <div className="inline-success">{message}</div> : null}

      <section className="split-layout">
        <form className="form-panel" onSubmit={handleSettingsSubmit}>
          <div className="section-heading">
            <p className="eyebrow">Manual season engine</p>
            <h2>Your local anchors</h2>
          </div>
          <div className="form-grid">
            <label>
              First frost
              <input type="date" value={settings.firstFrostDate} onChange={(event) => setSettings((current) => ({ ...current, firstFrostDate: event.target.value }))} />
            </label>
            <label>
              Last frost
              <input type="date" value={settings.lastFrostDate} onChange={(event) => setSettings((current) => ({ ...current, lastFrostDate: event.target.value }))} />
            </label>
            <label>
              Custom season date
              <input type="date" value={settings.customSeasonDate} onChange={(event) => setSettings((current) => ({ ...current, customSeasonDate: event.target.value }))} />
            </label>
            <label>
              Days since rain
              <input
                type="number"
                min="0"
                step="1"
                value={settings.conditionState.daysSinceRain}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    conditionState: { ...current.conditionState, daysSinceRain: Number(event.target.value) },
                  }))
                }
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.conditionState.frostWarning}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    conditionState: { ...current.conditionState, frostWarning: event.target.checked },
                  }))
                }
              />
              Frost warning placeholder
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.conditionState.manualStateActive}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    conditionState: { ...current.conditionState, manualStateActive: event.target.checked },
                  }))
                }
              />
              Manual state active
            </label>
          </div>
          <label>
            Manual state note
            <input
              value={settings.conditionState.manualStateNote}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  conditionState: { ...current.conditionState, manualStateNote: event.target.value },
                }))
              }
              placeholder="Feed bin low, ground finally dry, frost cloth staged"
            />
          </label>
          <Button type="submit">
            <Save size={18} />
            Save settings
          </Button>
        </form>

        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Templates</p>
            <h2>Simple and editable</h2>
          </div>
          {data.members.length === 0 ? (
            <EmptyState title="Add a member before templates">Templates need one owner. The first adult, or first member, gets the drafted chores.</EmptyState>
          ) : (
            <div className="compact-list">
              {SEASON_TEMPLATES.map((template) => (
                <article className="compact-row template-row" key={template.id}>
                  <div>
                    <strong>{template.title}</strong>
                    <span>{template.description}</span>
                    <small>{template.chores.length} chore{template.chores.length === 1 ? "" : "s"}</small>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => handleTemplate(template.id)}>
                    <CalendarPlus size={18} />
                    Draft
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
