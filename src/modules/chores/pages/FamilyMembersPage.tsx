import { ArrowLeft, Edit, Plus, Save, Trash2, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button, LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { MEMBER_COLORS, MEMBER_ROLE_OPTIONS, memberRoleLabel } from "../constants";
import type { HouseholdMember, HouseholdMemberRole } from "../types";
import { useChores } from "../useChores";

export function FamilyMembersPage() {
  const { data, addMember, updateMember, deleteMember, setActiveMember } = useChores();
  const [editing, setEditing] = useState<HouseholdMember | null>(null);
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [role, setRole] = useState<HouseholdMemberRole>("adult");
  const [age, setAge] = useState("");
  const [color, setColor] = useState(MEMBER_COLORS[0]);

  useEffect(() => {
    setName(editing?.name || "");
    setInitials(editing?.initials || "");
    setRole(editing?.role || "adult");
    setAge(editing?.age?.toString() || "");
    setColor(editing?.color || MEMBER_COLORS[0]);
  }, [editing]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      name,
      initials,
      role,
      age: age ? Number(age) : undefined,
      color,
    };
    if (editing) {
      updateMember(editing.id, input);
    } else {
      addMember(input);
    }
    setEditing(null);
    setName("");
    setInitials("");
    setAge("");
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Family members"
        title="Local people, visible ownership"
        actions={
          <LinkButton to="/chores" variant="secondary">
            <ArrowLeft size={18} />
            Chores
          </LinkButton>
        }
      >
        <p>No accounts yet. Members are local labels for ownership, initials, Kid Mode, and completion attribution.</p>
      </PageHeader>

      <section className="split-layout">
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <p className="eyebrow">{editing ? "Edit member" : "Add member"}</p>
            <h2>{editing ? editing.name : "Who can own work?"}</h2>
          </div>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Anna" />
          </label>
          <div className="form-grid">
            <label>
              Initials
              <input value={initials} onChange={(event) => setInitials(event.target.value)} maxLength={4} placeholder="A" />
            </label>
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as HouseholdMemberRole)}>
                {MEMBER_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Age
              <input type="number" min="0" step="1" value={age} onChange={(event) => setAge(event.target.value)} placeholder="Optional" />
            </label>
            <fieldset>
              <legend>Color</legend>
              <div className="color-swatch-row">
                {MEMBER_COLORS.map((entry) => (
                  <button key={entry} type="button" className={entry === color ? "active" : undefined} style={{ background: entry }} onClick={() => setColor(entry)} aria-label={`Use color ${entry}`} />
                ))}
              </div>
            </fieldset>
          </div>
          <div className="button-row">
            <Button type="submit">
              <Save size={18} />
              Save member
            </Button>
            {editing ? (
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>

        <div className="pantry-panel">
          <div className="section-heading">
            <p className="eyebrow">Household</p>
            <h2>{data.members.length || "No"} member{data.members.length === 1 ? "" : "s"}</h2>
          </div>
          <div className="compact-list">
            {data.members.map((member) => {
              const ownedCount = data.chores.filter((chore) => chore.ownerMemberId === member.id && chore.status !== "archived").length;
              return (
                <div className="compact-row member-row" key={member.id}>
                  <div>
                    <span className="member-avatar" style={{ background: member.color || MEMBER_COLORS[0] }}>
                      {member.initials}
                    </span>
                    <div>
                      <strong>{member.name}</strong>
                      <span>{memberRoleLabel(member.role)}{member.age !== undefined ? ` · age ${member.age}` : ""} · {ownedCount} owned</span>
                    </div>
                  </div>
                  <div className="button-row">
                    <Button type="button" variant="secondary" onClick={() => setActiveMember(member.id)}>
                      <UserRound size={18} />
                      Act as
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setEditing(member)}>
                      <Edit size={18} />
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => deleteMember(member.id)} aria-label={`Delete ${member.name}`}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              );
            })}
            {data.members.length === 0 ? <p className="muted">Add the first member to start assigning chores.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
