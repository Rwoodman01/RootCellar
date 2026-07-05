import { useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { productLabel } from "../constants";
import type { PreservationItem } from "../types";

interface SessionFormProps {
  items: PreservationItem[];
  onSubmit: (input: { title: string; date: string; itemIds: string[]; notes: string }) => void;
}

export function SessionForm({ items, onSubmit }: SessionFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [itemIds, setItemIds] = useState<string[]>([]);

  const fallbackTitle = useMemo(() => {
    if (itemIds.length === 1) {
      const item = items.find((entry) => entry.id === itemIds[0]);
      return item ? `${productLabel(item.productType, item.customName)} session` : "Kitchen session";
    }
    return itemIds.length > 1 ? "Canning session" : "Kitchen session";
  }, [itemIds, items]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      title: title.trim() || fallbackTitle,
      date,
      itemIds,
      notes,
    });
    setTitle("");
    setDate("");
    setNotes("");
    setItemIds([]);
  };

  const toggleItem = (itemId: string) => {
    setItemIds((current) => (current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]));
  };

  return (
    <form className="session-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Session name
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={fallbackTitle} />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      {items.length ? (
        <fieldset className="checkbox-fieldset">
          <legend>Items for this session</legend>
          <div className="checkbox-list">
            {items.map((item) => (
              <label key={item.id}>
                <input type="checkbox" checked={itemIds.includes(item.id)} onChange={() => toggleItem(item.id)} />
                <span>{productLabel(item.productType, item.customName)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <label>
        Notes
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
      </label>

      <Button type="submit" variant="secondary">
        <CalendarPlus size={18} />
        Add session
      </Button>
    </form>
  );
}
