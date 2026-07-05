import { ArrowLeft, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { RECURRENCE_OPTIONS, STATUS_OPTIONS, choreStatusLabel, recurrenceTypeLabel } from "../constants";
import { getChoreUrgency, recurrenceSummary } from "../choreUtils";
import type { ChoreRecurrenceType, ChoreStatus } from "../types";
import { useChores } from "../useChores";

export function ChoreListPage() {
  const { data } = useChores();
  const searchParams = new URLSearchParams(window.location.search);
  const initialOwner = searchParams.get("owner") || "all";
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState(initialOwner);
  const [type, setType] = useState<ChoreRecurrenceType | "all">("all");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState<ChoreStatus | "all">("active");
  const locations = Array.from(new Set(data.chores.map((chore) => chore.location).filter(Boolean))).sort();
  const filtered = data.chores.filter((chore) => {
    const haystack = [chore.title, chore.location, chore.howWeDoIt, chore.linkedEntity?.label].join(" ").toLowerCase();
    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesOwner = owner === "all" || chore.ownerMemberId === owner;
    const matchesType = type === "all" || chore.recurrenceType === type;
    const matchesLocation = location === "all" || chore.location === location;
    const matchesStatus = status === "all" || chore.status === status;
    return matchesSearch && matchesOwner && matchesType && matchesLocation && matchesStatus;
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Chore list"
        title="Search, filter, pause, or open the work"
        actions={
          <>
            <LinkButton to="/chores" variant="secondary">
              <ArrowLeft size={18} />
              Overview
            </LinkButton>
            <LinkButton to="/chores/new">
              <Plus size={18} />
              Add chore
            </LinkButton>
          </>
        }
      >
        <p>Every chore keeps one owner, one recurrence shape, optional backup, location, effort, and how-we-do-it notes.</p>
      </PageHeader>

      <section className="filter-panel chore-filter-panel">
        <label>
          <span>
            <Search size={16} /> Search
          </span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="muck, water, jars, coop" />
        </label>
        <label>
          Owner
          <select value={owner} onChange={(event) => setOwner(event.target.value)}>
            <option value="all">All owners</option>
            {data.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value as ChoreRecurrenceType | "all")}>
            <option value="all">All types</option>
            {RECURRENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Zone
          <select value={location} onChange={(event) => setLocation(event.target.value)}>
            <option value="all">All zones</option>
            {locations.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as ChoreStatus | "all")}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="compact-list">
        {filtered.map((chore) => {
          const ownerName = data.members.find((member) => member.id === chore.ownerMemberId)?.name || "Unowned";
          const urgency = getChoreUrgency(chore, data.completions, undefined, data);
          return (
            <Link to={`/chores/${chore.id}`} className="garden-record-row chore-list-row" key={chore.id}>
              <div>
                <span>{recurrenceTypeLabel(chore.recurrenceType)} · {choreStatusLabel(chore.status)}</span>
                <strong>{chore.title}</strong>
                <small>
                  {ownerName} · {recurrenceSummary(chore, data)}
                </small>
              </div>
              <div className="chore-list-meta">
                <span className={`chore-status-pill chore-status-${urgency.status}`}>{urgency.label}</span>
                <small>{chore.location || "No zone"}</small>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 ? <p className="muted">No chores match those filters.</p> : null}
      </section>
    </div>
  );
}
