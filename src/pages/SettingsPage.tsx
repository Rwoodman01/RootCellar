import { Download, Trash2 } from "lucide-react";
import { PageHeader } from "../shared/components/PageHeader";
import { Button } from "../shared/components/Button";
import { clearRootcellarData, loadRootcellarData } from "../shared/storage/rootcellarStorage";

function downloadLocalData() {
  const data = loadRootcellarData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `rootcellar-alpha-data-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SettingsPage() {
  const handleClearData = () => {
    const confirmed = window.confirm("Clear all local Rootcellar alpha data from this browser?");
    if (!confirmed) return;

    clearRootcellarData();
    window.location.assign("/dashboard");
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Settings" title="About this alpha">
        <p>Rootcellar currently stores all alpha data in this browser. There is no account, backend, payment, or AI service.</p>
      </PageHeader>

      <section className="settings-grid">
        <div className="settings-panel">
          <h2>Built now</h2>
          <ul className="plain-list">
            <li>Preservation plans</li>
            <li>Items, estimates, sessions, shopping lists</li>
            <li>Print-ready plan view</li>
            <li>Pantry products, batches, locations, and rotation notes</li>
            <li>Garden beds, plantings, harvests, seed packets, and frost settings</li>
            <li>Animal groups, individuals, events, care reminders, feed, and production</li>
            <li>Chores with fixed, decay, condition, season-anchored, and burst recurrence</li>
            <li>Family members, Kid Mode, skip reasons, and Weekly Chore Review</li>
            <li>Local browser persistence</li>
          </ul>
        </div>
        <div className="settings-panel">
          <h2>Intentionally not built yet</h2>
          <ul className="plain-list">
            <li>Accounts or household sharing</li>
            <li>Backend sync</li>
            <li>Payments</li>
            <li>Ask Rootcellar</li>
            <li>AI features</li>
            <li>Push-notification nagging, points, streaks, allowance, or approval queues</li>
          </ul>
        </div>
      </section>

      <section className="settings-panel">
        <h2>Documents and equipment</h2>
        <p>Documents and Equipment are not standalone V1 modules. Photos, notes, receipts, labels, and equipment maintenance live inside the modules they belong to.</p>
      </section>

      <section className="settings-panel">
        <h2>Local data</h2>
        <p>Export the current browser data as JSON, or clear it before another household test.</p>
        <div className="button-row">
          <Button type="button" variant="secondary" onClick={downloadLocalData}>
            <Download size={18} />
            Export data
          </Button>
          <Button type="button" variant="danger" onClick={handleClearData}>
            <Trash2 size={18} />
            Clear local data
          </Button>
        </div>
      </section>
    </div>
  );
}
