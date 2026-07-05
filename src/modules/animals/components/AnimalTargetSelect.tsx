import { getAnimalTargets, parseTargetValue, targetValue } from "../animalUtils";
import type { AnimalData } from "../types";

interface AnimalTargetSelectProps {
  data: AnimalData;
  groupId?: string;
  animalId?: string;
  onChange: (target: { groupId?: string; animalId?: string }) => void;
  label?: string;
  required?: boolean;
}

export function AnimalTargetSelect({ data, groupId, animalId, onChange, label = "Animal or group", required = false }: AnimalTargetSelectProps) {
  const targets = getAnimalTargets(data);

  return (
    <label>
      {label}
      <select value={targetValue({ groupId, animalId })} onChange={(event) => onChange(parseTargetValue(event.target.value))} required={required}>
        <option value="">Choose a group or individual</option>
        {targets.map((target) => (
          <option key={`${target.type}:${target.id}`} value={`${target.type}:${target.id}`}>
            {target.type === "group" ? "Group" : "Individual"} - {target.label} ({target.species})
          </option>
        ))}
      </select>
    </label>
  );
}

