import { FormEvent, useState } from "react";
import { Image, Save, Trash2 } from "lucide-react";
import { Button, LinkButton } from "../../../shared/components/Button";
import { PageHeader } from "../../../shared/components/PageHeader";
import { currentYear } from "../../../shared/utils/dates";
import { seedPacketWarning } from "../calculations";
import type { SeedPacketInput } from "../types";
import { useGarden } from "../useGarden";

export function SeedPacketsPage() {
  const { data, addSeedPacket, updateSeedPacket, deleteSeedPacket } = useGarden();
  const firstVariety = data.varieties[0];
  const emptyPacket: SeedPacketInput = { varietyId: firstVariety?.id || "", yearPacked: currentYear(), quantityEstimate: "", seedBoxLocation: "", photoPlaceholder: "", notes: "" };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SeedPacketInput>(emptyPacket);
  const editing = data.seedPackets.find((packet) => packet.id === editingId);

  const edit = (id: string) => {
    const packet = data.seedPackets.find((entry) => entry.id === id);
    if (!packet) return;
    setEditingId(id);
    setForm({ varietyId: packet.varietyId, yearPacked: packet.yearPacked, quantityEstimate: packet.quantityEstimate, seedBoxLocation: packet.seedBoxLocation, photoPlaceholder: packet.photoPlaceholder, notes: packet.notes });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.varietyId) return;
    if (editing) updateSeedPacket(editing.id, form);
    else addSeedPacket(form);
    setEditingId(null);
    setForm(emptyPacket);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Seed packets" title="The seed box, without the shoebox archaeology" actions={<LinkButton to="/garden/varieties">Add variety first</LinkButton>}>
        <p>Track packet year, rough quantity, location, and simple viability warnings. Photos stay as placeholders in V1.</p>
      </PageHeader>
      <form className="form-panel" onSubmit={submit}>
        <div className="form-grid">
          <label>Variety<select value={form.varietyId} onChange={(event) => setForm({ ...form, varietyId: event.target.value })} required><option value="">Choose variety</option>{data.varieties.map((variety) => <option key={variety.id} value={variety.id}>{variety.name} ({variety.crop})</option>)}</select></label>
          <label>Year packed<input type="number" min="1900" value={form.yearPacked} onChange={(event) => setForm({ ...form, yearPacked: Number(event.target.value) })} /></label>
          <label>Quantity estimate<input value={form.quantityEstimate} onChange={(event) => setForm({ ...form, quantityEstimate: event.target.value })} placeholder="Half packet, 40 seeds" /></label>
          <label>Seed box location<input value={form.seedBoxLocation} onChange={(event) => setForm({ ...form, seedBoxLocation: event.target.value })} placeholder="Bin A, tomato envelope" /></label>
        </div>
        <label>Notes<textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <Button type="submit"><Save size={18} />{editing ? "Save packet" : "Add packet"}</Button>
      </form>
      <section className="plan-list">
        {data.seedPackets.map((packet) => {
          const variety = data.varieties.find((entry) => entry.id === packet.varietyId);
          const warning = seedPacketWarning(packet, variety);
          return <article className="garden-record-row" key={packet.id}><div><span>{variety?.crop || "Unknown crop"} · packed {packet.yearPacked}</span><strong>{variety?.name || "Removed variety"}</strong><small>{packet.quantityEstimate || "Quantity unknown"} · {packet.seedBoxLocation || "No location"}</small>{warning ? <p className="disclaimer">{warning}</p> : null}<p className="muted"><Image size={14} /> Photo placeholder only</p></div><div className="item-actions"><Button type="button" variant="secondary" onClick={() => edit(packet.id)}>Edit</Button><Button type="button" variant="ghost" onClick={() => deleteSeedPacket(packet.id)} aria-label="Delete seed packet"><Trash2 size={18} /></Button></div></article>;
        })}
      </section>
    </div>
  );
}
