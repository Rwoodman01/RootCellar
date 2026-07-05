import type { HouseholdMember } from "../types";

export function MemberBadge({ member, label }: { member?: HouseholdMember; label?: string }) {
  return (
    <span className="member-badge" title={member?.name || "Unowned"}>
      <span style={{ background: member?.color || "#a9792b" }}>{member?.initials || "?"}</span>
      {label || member?.name || "Unowned"}
    </span>
  );
}
