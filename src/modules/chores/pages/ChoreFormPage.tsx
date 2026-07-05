import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, LinkButton } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageHeader } from "../../../shared/components/PageHeader";
import { useAnimals } from "../../animals/useAnimals";
import { useGarden } from "../../garden/useGarden";
import {
  BLOCK_OPTIONS,
  CONDITION_OPTIONS,
  EFFORT_OPTIONS,
  FIXED_CADENCE_OPTIONS,
  LINKED_ENTITY_OPTIONS,
  RECURRENCE_OPTIONS,
  SEASON_ANCHOR_OPTIONS,
  STATUS_OPTIONS,
  VERIFICATION_OPTIONS,
  WEEKDAY_OPTIONS,
} from "../constants";
import { todayDate } from "../choreUtils";
import type {
  BurstChecklistItem,
  ChoreDayBlock,
  ChoreEffort,
  ChoreInput,
  ChoreLinkedEntityType,
  ChoreRecurrenceParams,
  ChoreRecurrenceType,
  ChoreStatus,
  ChoreVerification,
  ConditionType,
  FixedCadence,
  SeasonAnchorType,
} from "../types";
import { useChore, useChores } from "../useChores";

interface DraftBurstItem {
  id?: string;
  title: string;
  ownerMemberId: string;
  notes: string;
  completedAt?: string;
}

export function ChoreFormPage() {
  const { choreId } = useParams();
  const chore = useChore(choreId);
  const { data, addChore, updateChore, deleteChore } = useChores();
  const { data: animals } = useAnimals();
  const { data: garden } = useGarden();
  const navigate = useNavigate();
  const isEditing = Boolean(choreId);
  const defaultOwnerId = chore?.ownerMemberId || data.members[0]?.id || "";
  const existingItems = chore ? data.burstItems.filter((item) => item.choreId === chore.id) : [];

  const initial = useMemo(() => buildInitial(chore, existingItems, defaultOwnerId), [chore, defaultOwnerId, existingItems]);
  const [title, setTitle] = useState(initial.title);
  const [ownerMemberId, setOwnerMemberId] = useState(initial.ownerMemberId);
  const [backupMemberId, setBackupMemberId] = useState(initial.backupMemberId);
  const [recurrenceType, setRecurrenceType] = useState<ChoreRecurrenceType>(initial.recurrenceType);
  const [block, setBlock] = useState<ChoreDayBlock>(initial.block);
  const [fixedCadence, setFixedCadence] = useState<FixedCadence>(initial.fixedCadence);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initial.daysOfWeek);
  const [dayOfMonth, setDayOfMonth] = useState(initial.dayOfMonth);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [intervalDays, setIntervalDays] = useState(initial.intervalDays);
  const [conditionType, setConditionType] = useState<ConditionType>(initial.conditionType);
  const [thresholdDays, setThresholdDays] = useState(initial.thresholdDays);
  const [conditionActive, setConditionActive] = useState(initial.conditionActive);
  const [conditionNote, setConditionNote] = useState(initial.conditionNote);
  const [seasonAnchor, setSeasonAnchor] = useState<SeasonAnchorType>(initial.seasonAnchor);
  const [offsetDays, setOffsetDays] = useState(initial.offsetDays);
  const [customDate, setCustomDate] = useState(initial.customDate);
  const [dueWindowDays, setDueWindowDays] = useState(initial.dueWindowDays);
  const [windowStart, setWindowStart] = useState(initial.windowStart);
  const [windowEnd, setWindowEnd] = useState(initial.windowEnd);
  const [burstItems, setBurstItems] = useState<DraftBurstItem[]>(initial.burstItems);
  const [linkedEntityType, setLinkedEntityType] = useState<ChoreLinkedEntityType | "">((chore?.linkedEntity?.type as ChoreLinkedEntityType) || "");
  const [linkedEntityId, setLinkedEntityId] = useState(chore?.linkedEntity?.id || "");
  const [linkedEntityLabel, setLinkedEntityLabel] = useState(chore?.linkedEntity?.label || "");
  const [location, setLocation] = useState(chore?.location || "");
  const [seasonWindow, setSeasonWindow] = useState(chore?.seasonWindow || "");
  const [effort, setEffort] = useState<ChoreEffort>(chore?.effort || "M");
  const [minAge, setMinAge] = useState(chore?.minAge?.toString() || "");
  const [verification, setVerification] = useState<ChoreVerification>(chore?.verification || "trust");
  const [howWeDoIt, setHowWeDoIt] = useState(chore?.howWeDoIt || "");
  const [status, setStatus] = useState<ChoreStatus>(chore?.status || "active");

  const animalOptions = [
    ...animals.groups.map((group) => ({ id: group.id, label: `${group.name} group` })),
    ...animals.individuals.map((animal) => ({ id: animal.id, label: animal.name })),
  ];
  const gardenBedOptions = garden.beds.map((bed) => ({ id: bed.id, label: `${bed.areaName}: ${bed.name}` }));
  const linkedOptions = linkedEntityType === "animal" ? animalOptions : linkedEntityType === "garden_bed" ? gardenBedOptions : [];

  if (isEditing && !chore) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Chores" title="Chore not found" />
        <LinkButton to="/chores/list" variant="secondary">
          <ArrowLeft size={18} />
          Back to chores
        </LinkButton>
      </div>
    );
  }

  if (data.members.length === 0) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Chores" title="Add people before chores" />
        <EmptyState
          title="Every chore needs one owner"
          action={
            <LinkButton to="/chores/members">
              <Plus size={18} />
              Add family member
            </LinkButton>
          }
        >
          Rootcellar keeps ownership plain and visible, so chores start after at least one local family member exists.
        </EmptyState>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = buildParams();
    const input: ChoreInput = {
      title,
      ownerMemberId,
      backupMemberId,
      recurrenceType,
      recurrenceParams: params,
      linkedEntity: linkedEntityType
        ? {
            type: linkedEntityType,
            id: linkedEntityId || undefined,
            label: linkedEntityLabel || linkedOptions.find((option) => option.id === linkedEntityId)?.label || "",
          }
        : undefined,
      location,
      seasonWindow,
      effort,
      minAge: minAge ? Number(minAge) : undefined,
      verification,
      howWeDoIt,
      status,
      burstItems: recurrenceType === "burst" ? burstItems : [],
    };
    const saved = chore ? (updateChore(chore.id, input), chore) : addChore(input);
    navigate(`/chores/${saved.id}`);
  };

  const handleDelete = () => {
    if (!chore) return;
    const confirmed = window.confirm(`Delete "${chore.title}" and its local completion history?`);
    if (!confirmed) return;
    deleteChore(chore.id);
    navigate("/chores/list");
  };

  const buildParams = (): ChoreRecurrenceParams => {
    if (recurrenceType === "decay") return { intervalDays, block };
    if (recurrenceType === "condition") return { conditionType, thresholdDays, isActive: conditionActive, conditionNote, block };
    if (recurrenceType === "season_anchor") return { anchor: seasonAnchor, offsetDays, customDate, dueWindowDays, block };
    if (recurrenceType === "burst") return { windowStart, windowEnd, block };
    return { cadence: fixedCadence, daysOfWeek, dayOfMonth, startDate, block };
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((current) => (current.includes(day) ? current.filter((entry) => entry !== day) : [...current, day].sort()));
  };

  const updateBurstItem = (index: number, patch: Partial<DraftBurstItem>) => {
    setBurstItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Chores" title={chore ? `Edit ${chore.title}` : "Add chore"}>
        <p>Use fixed dates for fixed work. Use decay, conditions, seasons, and bursts for land-shaped work.</p>
      </PageHeader>

      <form className="form-panel chore-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Muck the coop" />
          </label>
          <label>
            Owner
            <select value={ownerMemberId} onChange={(event) => setOwnerMemberId(event.target.value)} required>
              {data.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Backup
            <select value={backupMemberId} onChange={(event) => setBackupMemberId(event.target.value)}>
              <option value="">No backup yet</option>
              {data.members
                .filter((member) => member.id !== ownerMemberId)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Recurrence type
            <select value={recurrenceType} onChange={(event) => setRecurrenceType(event.target.value as ChoreRecurrenceType)}>
              {RECURRENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="chore-recurrence-panel">
          <div className="section-heading">
            <p className="eyebrow">Recurrence</p>
            <h2>{RECURRENCE_OPTIONS.find((option) => option.value === recurrenceType)?.help}</h2>
          </div>
          <label>
            Day block
            <select value={block} onChange={(event) => setBlock(event.target.value as ChoreDayBlock)}>
              {BLOCK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {recurrenceType === "fixed" ? (
            <div className="form-grid">
              <label>
                Cadence
                <select value={fixedCadence} onChange={(event) => setFixedCadence(event.target.value as FixedCadence)}>
                  {FIXED_CADENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Start date
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </label>
              {fixedCadence === "weekly" ? (
                <fieldset className="checkbox-list">
                  <legend>Days of week</legend>
                  {WEEKDAY_OPTIONS.map((option) => (
                    <label key={option.value}>
                      <input type="checkbox" checked={daysOfWeek.includes(option.value)} onChange={() => toggleDay(option.value)} />
                      {option.label}
                    </label>
                  ))}
                </fieldset>
              ) : null}
              {fixedCadence === "monthly" ? (
                <label>
                  Day of month
                  <input type="number" min="1" max="31" step="1" value={dayOfMonth} onChange={(event) => setDayOfMonth(Number(event.target.value))} />
                </label>
              ) : null}
            </div>
          ) : null}

          {recurrenceType === "decay" ? (
            <label>
              Interval days
              <input type="number" min="1" step="1" value={intervalDays} onChange={(event) => setIntervalDays(Number(event.target.value))} />
            </label>
          ) : null}

          {recurrenceType === "condition" ? (
            <div className="form-grid">
              <label>
                Condition
                <select value={conditionType} onChange={(event) => setConditionType(event.target.value as ConditionType)}>
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {conditionType === "no_rain" ? (
                <label>
                  Dry days threshold
                  <input type="number" min="0" step="1" value={thresholdDays} onChange={(event) => setThresholdDays(Number(event.target.value))} />
                </label>
              ) : null}
              <label className="checkbox-row">
                <input type="checkbox" checked={conditionActive} onChange={(event) => setConditionActive(event.target.checked)} />
                Manual condition active
              </label>
              <label>
                Condition note
                <input value={conditionNote} onChange={(event) => setConditionNote(event.target.value)} placeholder="Feed bin is low" />
              </label>
            </div>
          ) : null}

          {recurrenceType === "season_anchor" ? (
            <div className="form-grid">
              <label>
                Anchor
                <select value={seasonAnchor} onChange={(event) => setSeasonAnchor(event.target.value as SeasonAnchorType)}>
                  {SEASON_ANCHOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Offset days
                <input type="number" step="1" value={offsetDays} onChange={(event) => setOffsetDays(Number(event.target.value))} />
              </label>
              {seasonAnchor === "custom" ? (
                <label>
                  Custom date
                  <input type="date" value={customDate} onChange={(event) => setCustomDate(event.target.value)} />
                </label>
              ) : null}
              <label>
                Surface window, days
                <input type="number" min="0" step="1" value={dueWindowDays} onChange={(event) => setDueWindowDays(Number(event.target.value))} />
              </label>
            </div>
          ) : null}

          {recurrenceType === "burst" ? (
            <div className="burst-form">
              <div className="form-grid">
                <label>
                  Window start
                  <input type="date" value={windowStart} onChange={(event) => setWindowStart(event.target.value)} />
                </label>
                <label>
                  Window end
                  <input type="date" value={windowEnd} onChange={(event) => setWindowEnd(event.target.value)} />
                </label>
              </div>
              <div className="section-heading section-heading-row">
                <div>
                  <p className="eyebrow">Checklist</p>
                  <h2>Assigned line items</h2>
                </div>
                <Button type="button" variant="secondary" onClick={() => setBurstItems((current) => [...current, { title: "", ownerMemberId, notes: "" }])}>
                  <Plus size={18} />
                  Add item
                </Button>
              </div>
              <div className="compact-list">
                {burstItems.map((item, index) => (
                  <div className="burst-item-form" key={item.id || index}>
                    <label>
                      Item
                      <input value={item.title} onChange={(event) => updateBurstItem(index, { title: event.target.value })} placeholder="Clean jars" />
                    </label>
                    <label>
                      Owner
                      <select value={item.ownerMemberId || ownerMemberId} onChange={(event) => updateBurstItem(index, { ownerMemberId: event.target.value })}>
                        {data.members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button type="button" variant="ghost" onClick={() => setBurstItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove checklist item">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="chore-recurrence-panel">
          <div className="section-heading">
            <p className="eyebrow">Context</p>
            <h2>Where this work lives</h2>
          </div>
          <div className="form-grid">
            <label>
              Linked entity
              <select
                value={linkedEntityType}
                onChange={(event) => {
                  setLinkedEntityType(event.target.value as ChoreLinkedEntityType | "");
                  setLinkedEntityId("");
                  setLinkedEntityLabel("");
                }}
              >
                <option value="">No link</option>
                {LINKED_ENTITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {linkedEntityType && linkedOptions.length ? (
              <label>
                Link target
                <select
                  value={linkedEntityId}
                  onChange={(event) => {
                    setLinkedEntityId(event.target.value);
                    setLinkedEntityLabel(linkedOptions.find((option) => option.id === event.target.value)?.label || "");
                  }}
                >
                  <option value="">Choose target</option>
                  {linkedOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : linkedEntityType ? (
              <label>
                Link label
                <input value={linkedEntityLabel} onChange={(event) => setLinkedEntityLabel(event.target.value)} placeholder="Laying flock, North Garden, water pump" />
              </label>
            ) : null}
            <label>
              Location / zone
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Coop, barn, North Garden" />
            </label>
            <label>
              Season window
              <input value={seasonWindow} onChange={(event) => setSeasonWindow(event.target.value)} placeholder="Fall prep, winter animal care" />
            </label>
            <label>
              Effort
              <select value={effort} onChange={(event) => setEffort(event.target.value as ChoreEffort)}>
                {EFFORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Minimum age
              <input type="number" min="0" step="1" value={minAge} onChange={(event) => setMinAge(event.target.value)} placeholder="Optional" />
            </label>
            <label>
              Verification
              <select value={verification} onChange={(event) => setVerification(event.target.value as ChoreVerification)}>
                {VERIFICATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as ChoreStatus)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            How we do it
            <textarea value={howWeDoIt} onChange={(event) => setHowWeDoIt(event.target.value)} rows={5} placeholder="The household version of done." />
          </label>
        </section>

        <div className="button-row">
          <Link className="button button-secondary" to={chore ? `/chores/${chore.id}` : "/chores"}>
            <ArrowLeft size={18} />
            Back
          </Link>
          <Button type="submit">
            <Save size={18} />
            Save chore
          </Button>
          {chore ? (
            <Button type="button" variant="danger" onClick={handleDelete}>
              <Trash2 size={18} />
              Delete
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function buildInitial(chore: ReturnType<typeof useChore>, burstItems: BurstChecklistItem[], defaultOwnerId: string) {
  const params = chore?.recurrenceParams;
  const raw = (params || {}) as Record<string, unknown>;
  const type = chore?.recurrenceType || "fixed";
  return {
    title: chore?.title || "",
    ownerMemberId: defaultOwnerId,
    backupMemberId: chore?.backupMemberId || "",
    recurrenceType: type,
    block: (raw.block as ChoreDayBlock) || "Anytime",
    fixedCadence: type === "fixed" && ["daily", "weekly", "monthly"].includes(String(raw.cadence)) ? (raw.cadence as FixedCadence) : "daily",
    daysOfWeek: type === "fixed" && Array.isArray(raw.daysOfWeek) ? (raw.daysOfWeek as number[]) : [],
    dayOfMonth: type === "fixed" ? Number(raw.dayOfMonth || 1) : 1,
    startDate: type === "fixed" ? String(raw.startDate || todayDate()) : todayDate(),
    intervalDays: type === "decay" ? Number(raw.intervalDays || 10) : 10,
    conditionType: type === "condition" ? (raw.conditionType as ConditionType) || "no_rain" : "no_rain",
    thresholdDays: type === "condition" ? Number(raw.thresholdDays || 3) : 3,
    conditionActive: type === "condition" ? Boolean(raw.isActive) : false,
    conditionNote: type === "condition" ? String(raw.conditionNote || "") : "",
    seasonAnchor: type === "season_anchor" ? (raw.anchor as SeasonAnchorType) || "first_frost" : "first_frost",
    offsetDays: type === "season_anchor" ? Number(raw.offsetDays ?? -21) : -21,
    customDate: type === "season_anchor" ? String(raw.customDate || todayDate()) : todayDate(),
    dueWindowDays: type === "season_anchor" ? Number(raw.dueWindowDays || 14) : 14,
    windowStart: type === "burst" ? String(raw.windowStart || todayDate()) : todayDate(),
    windowEnd: type === "burst" ? String(raw.windowEnd || todayDate()) : todayDate(),
    burstItems: burstItems.length ? burstItems.map((item) => ({ id: item.id, title: item.title, ownerMemberId: item.ownerMemberId || defaultOwnerId, notes: item.notes || "", completedAt: item.completedAt })) : [{ title: "", ownerMemberId: defaultOwnerId, notes: "" }],
  } satisfies {
    title: string;
    ownerMemberId: string;
    backupMemberId: string;
    recurrenceType: ChoreRecurrenceType;
    block: ChoreDayBlock;
    fixedCadence: FixedCadence;
    daysOfWeek: number[];
    dayOfMonth: number;
    startDate: string;
    intervalDays: number;
    conditionType: ConditionType;
    thresholdDays: number;
    conditionActive: boolean;
    conditionNote: string;
    seasonAnchor: SeasonAnchorType;
    offsetDays: number;
    customDate: string;
    dueWindowDays: number;
    windowStart: string;
    windowEnd: string;
    burstItems: DraftBurstItem[];
  };
}
