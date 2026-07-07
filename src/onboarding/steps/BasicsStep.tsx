import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/components/Button";
import { MEMBER_ROLE_OPTIONS } from "../../modules/chores/constants";
import type { HouseholdMemberRole } from "../../modules/chores/types";
import { useChores } from "../../modules/chores/useChores";
import { useGarden } from "../../modules/garden/useGarden";
import { loadRootcellarData, saveRootcellarData } from "../../shared/storage/rootcellarStorage";
import { useOnboarding } from "../useOnboarding";

export function BasicsStep() {
  const { state, setHouseholdBasics, setStep } = useOnboarding();
  const chores = useChores();
  const garden = useGarden();

  const [householdName, setHouseholdName] = useState(() => state.householdBasics.householdName || loadRootcellarData().householdProfile.householdName.replace("Our household", ""));
  const [lastFrostDate, setLastFrostDate] = useState(() => state.householdBasics.lastFrostDate || garden.data.settings.lastFrostDate);
  const [firstFrostDate, setFirstFrostDate] = useState(() => state.householdBasics.firstFrostDate || garden.data.settings.firstFrostDate);
  const [memberName, setMemberName] = useState("");
  const [memberInitials, setMemberInitials] = useState("");
  const [memberRole, setMemberRole] = useState<HouseholdMemberRole>("adult");

  function persistDraft(next: { householdName?: string; lastFrostDate?: string; firstFrostDate?: string }) {
    setHouseholdBasics({
      householdName: next.householdName ?? householdName,
      lastFrostDate: next.lastFrostDate ?? lastFrostDate,
      firstFrostDate: next.firstFrostDate ?? firstFrostDate,
    });
  }

  function addMember() {
    if (!memberName.trim()) return;
    chores.addMember({ name: memberName, initials: memberInitials, role: memberRole });
    setMemberName("");
    setMemberInitials("");
    setMemberRole("adult");
  }

  function handleContinue() {
    const current = loadRootcellarData();
    if (householdName.trim()) {
      saveRootcellarData({
        ...current,
        householdProfile: { ...current.householdProfile, householdName: householdName.trim(), updatedAt: new Date().toISOString() },
      });
    }
    if (lastFrostDate || firstFrostDate) {
      const nextLast = lastFrostDate || garden.data.settings.lastFrostDate;
      const nextFirst = firstFrostDate || garden.data.settings.firstFrostDate;
      garden.updateSettings({ lastFrostDate: nextLast, firstFrostDate: nextFirst });
      chores.updateSettings({ ...chores.data.settings, lastFrostDate: nextLast, firstFrostDate: nextFirst });
    }
    setStep(4);
  }

  return (
    <section>
      <p className="eyebrow">Step 3</p>
      <h1>Household basics</h1>
      <p>All optional. Add what helps; skip the rest for now.</p>

      <label>
        Household name
        <input
          value={householdName}
          onChange={(event) => {
            setHouseholdName(event.target.value);
            persistDraft({ householdName: event.target.value });
          }}
          placeholder="Woodman household"
        />
      </label>

      <div className="form-panel rhythm-inline-form">
        <div className="section-heading">
          <p className="eyebrow">Household members</p>
          <h2>Who's carrying the work?</h2>
        </div>
        {chores.data.members.length ? (
          <ul className="plain-list">
            {chores.data.members.map((member) => (
              <li key={member.id}>
                {member.name} ({member.initials}) · {MEMBER_ROLE_OPTIONS.find((option) => option.value === member.role)?.label}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="form-grid">
          <label>
            Name
            <input value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="June" />
          </label>
          <label>
            Initials
            <input value={memberInitials} onChange={(event) => setMemberInitials(event.target.value)} placeholder="JN" maxLength={3} />
          </label>
          <label>
            Role
            <select value={memberRole} onChange={(event) => setMemberRole(event.target.value as HouseholdMemberRole)}>
              {MEMBER_ROLE_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button type="button" variant="secondary" onClick={addMember}>
          <Plus size={18} />
          Add member
        </Button>
      </div>

      <div className="form-grid">
        <label>
          Last frost date
          <input
            type="date"
            value={lastFrostDate}
            onChange={(event) => {
              setLastFrostDate(event.target.value);
              persistDraft({ lastFrostDate: event.target.value });
            }}
          />
        </label>
        <label>
          First frost date
          <input
            type="date"
            value={firstFrostDate}
            onChange={(event) => {
              setFirstFrostDate(event.target.value);
              persistDraft({ firstFrostDate: event.target.value });
            }}
          />
        </label>
      </div>

      <div className="onboarding-actions">
        <Button type="button" variant="secondary" onClick={() => setStep(2)}>
          <ArrowLeft size={18} />
          Back
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continue
          <ArrowRight size={18} />
        </Button>
      </div>
    </section>
  );
}
