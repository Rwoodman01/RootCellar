import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { rootcellarModules } from "../../moduleRegistry";
import { Button } from "../../shared/components/Button";
import type { OnboardingRoomId } from "../../shared/storage/rootcellarStorage";
import { useOnboarding } from "../useOnboarding";

const ROOM_OPTIONS: Array<{ id: OnboardingRoomId; name: string }> = [
  { id: "preservation", name: "Preservation" },
  { id: "pantry", name: "Pantry, Freezer & Root Cellar" },
  { id: "garden", name: "Garden" },
  { id: "animals", name: "Animals" },
  { id: "chores", name: "Chores" },
];

export function RoomsStep() {
  const { state, setSelectedRooms, setStep } = useOnboarding();

  function toggleRoom(roomId: OnboardingRoomId) {
    const isSelected = state.selectedRooms.includes(roomId);
    setSelectedRooms(isSelected ? state.selectedRooms.filter((id) => id !== roomId) : [...state.selectedRooms, roomId]);
  }

  return (
    <section>
      <p className="eyebrow">Step 2</p>
      <h1>Choose your rooms</h1>
      <p>Pick the rooms you use now. You can add the rest later from Homestead.</p>
      <div className="room-card-grid">
        {ROOM_OPTIONS.map((room) => {
          const module = rootcellarModules.find((entry) => entry.id === room.id);
          const isSelected = state.selectedRooms.includes(room.id);
          const Icon = module?.icon;
          return (
            <button type="button" key={room.id} className={`room-card${isSelected ? " selected" : ""}`} onClick={() => toggleRoom(room.id)} aria-pressed={isSelected}>
              {isSelected ? (
                <span className="room-card-check">
                  <Check size={16} />
                </span>
              ) : null}
              {Icon ? <Icon size={22} aria-hidden="true" /> : null}
              <strong>{room.name}</strong>
              {module ? <span>{module.promise}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="onboarding-actions">
        <Button type="button" variant="secondary" onClick={() => setStep(1)}>
          <ArrowLeft size={18} />
          Back
        </Button>
        <Button type="button" onClick={() => setStep(3)}>
          Continue
          <ArrowRight size={18} />
        </Button>
      </div>
    </section>
  );
}
