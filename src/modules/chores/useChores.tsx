import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadRootcellarData, saveRootcellarData } from "../../shared/storage/rootcellarStorage";
import { makeId } from "../../shared/utils/id";
import { MEMBER_COLORS, SEASON_TEMPLATES } from "./constants";
import { ensureChoreData } from "./choreData";
import { addDays, todayDate } from "./choreUtils";
import type {
  BurstChecklistItem,
  BurstChecklistItemInput,
  BurstRecurrenceParams,
  Chore,
  ChoreCompletion,
  ChoreData,
  ChoreInput,
  ChoreSettings,
  ChoreSkippedReason,
  ChoreStatus,
  HouseholdMember,
  HouseholdMemberInput,
} from "./types";

interface ChoresContextValue {
  data: ChoreData;
  activeMember?: HouseholdMember;
  setActiveMember: (memberId: string) => void;
  addMember: (input: HouseholdMemberInput) => HouseholdMember;
  updateMember: (memberId: string, input: HouseholdMemberInput) => void;
  deleteMember: (memberId: string) => void;
  addChore: (input: ChoreInput) => Chore;
  updateChore: (choreId: string, input: ChoreInput) => void;
  deleteChore: (choreId: string) => void;
  completeChore: (choreId: string, memberId?: string, note?: string) => ChoreCompletion | null;
  skipChore: (choreId: string, reason: ChoreSkippedReason, memberId?: string, note?: string) => ChoreCompletion | null;
  updateChoreStatus: (choreId: string, status: ChoreStatus) => void;
  updateSettings: (settings: ChoreSettings) => void;
  toggleBurstItem: (itemId: string, memberId?: string) => void;
  updateBurstItem: (itemId: string, input: BurstChecklistItemInput) => void;
  addTemplate: (templateId: string) => number;
}

const ChoresContext = createContext<ChoresContextValue | null>(null);

export function ChoresProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ChoreData>(() => ensureChoreData(loadRootcellarData().chores));

  useEffect(() => {
    const current = loadRootcellarData();
    saveRootcellarData({
      ...current,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      chores: data,
    });
  }, [data]);

  const activeMember = useMemo(() => data.members.find((member) => member.id === data.settings.activeMemberId) || data.members[0], [data.members, data.settings.activeMemberId]);

  const setActiveMember = useCallback((memberId: string) => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        activeMemberId: memberId,
      },
    }));
  }, []);

  const addMember = useCallback((input: HouseholdMemberInput) => {
    const now = new Date().toISOString();
    const member: HouseholdMember = {
      ...input,
      id: makeId("member"),
      name: input.name.trim() || "Household member",
      initials: input.initials.trim().toUpperCase() || initialsFromName(input.name),
      age: input.age === undefined ? undefined : Math.max(0, Number(input.age) || 0),
      color: input.color || MEMBER_COLORS[0],
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({
      ...current,
      members: [...current.members, member],
      settings: {
        ...current.settings,
        activeMemberId: current.settings.activeMemberId || member.id,
      },
    }));
    return member;
  }, []);

  const updateMember = useCallback((memberId: string, input: HouseholdMemberInput) => {
    setData((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              ...input,
              name: input.name.trim() || "Household member",
              initials: input.initials.trim().toUpperCase() || initialsFromName(input.name),
              age: input.age === undefined ? undefined : Math.max(0, Number(input.age) || 0),
              color: input.color || member.color,
              updatedAt: new Date().toISOString(),
            }
          : member,
      ),
    }));
  }, []);

  const deleteMember = useCallback((memberId: string) => {
    setData((current) => {
      const nextMembers = current.members.filter((member) => member.id !== memberId);
      return {
        ...current,
        members: nextMembers,
        settings: {
          ...current.settings,
          activeMemberId: current.settings.activeMemberId === memberId ? nextMembers[0]?.id : current.settings.activeMemberId,
        },
      };
    });
  }, []);

  const addChore = useCallback((input: ChoreInput) => {
    const now = new Date().toISOString();
    const chore: Chore = {
      ...input,
      id: makeId("chore"),
      title: input.title.trim() || "Untitled chore",
      ownerMemberId: input.ownerMemberId,
      backupMemberId: input.backupMemberId || undefined,
      location: input.location?.trim() || "",
      seasonWindow: input.seasonWindow?.trim() || "",
      minAge: input.minAge === undefined ? undefined : Math.max(0, Number(input.minAge) || 0),
      howWeDoIt: input.howWeDoIt?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };
    const burstItems = makeBurstItems(chore.id, input.burstItems || [], chore.ownerMemberId);
    setData((current) => ({
      ...current,
      chores: [chore, ...current.chores],
      burstItems: [...burstItems, ...current.burstItems],
    }));
    return chore;
  }, []);

  const updateChore = useCallback((choreId: string, input: ChoreInput) => {
    setData((current) => {
      const nextBurstItems = input.recurrenceType === "burst" ? makeBurstItems(choreId, input.burstItems || [], input.ownerMemberId) : [];
      return {
        ...current,
        chores: current.chores.map((chore) =>
          chore.id === choreId
            ? {
                ...chore,
                ...input,
                title: input.title.trim() || "Untitled chore",
                backupMemberId: input.backupMemberId || undefined,
                location: input.location?.trim() || "",
                seasonWindow: input.seasonWindow?.trim() || "",
                minAge: input.minAge === undefined ? undefined : Math.max(0, Number(input.minAge) || 0),
                howWeDoIt: input.howWeDoIt?.trim() || "",
                updatedAt: new Date().toISOString(),
              }
            : chore,
        ),
        burstItems: [...current.burstItems.filter((item) => item.choreId !== choreId), ...nextBurstItems],
      };
    });
  }, []);

  const deleteChore = useCallback((choreId: string) => {
    setData((current) => ({
      ...current,
      chores: current.chores.filter((chore) => chore.id !== choreId),
      completions: current.completions.filter((completion) => completion.choreId !== choreId),
      burstItems: current.burstItems.filter((item) => item.choreId !== choreId),
    }));
  }, []);

  const completeChore = useCallback((choreId: string, memberId?: string, note?: string) => {
    let created: ChoreCompletion | null = null;
    setData((current) => {
      const chore = current.chores.find((entry) => entry.id === choreId);
      if (!chore) return current;
      const actorId = memberId || current.settings.activeMemberId || chore.ownerMemberId;
      created = {
        id: makeId("completion"),
        choreId,
        memberId: actorId,
        completedAt: new Date().toISOString(),
        note: note?.trim() || "",
        action: "completed",
      };
      return {
        ...current,
        settings: { ...current.settings, activeMemberId: actorId },
        completions: [created, ...current.completions],
      };
    });
    return created;
  }, []);

  const skipChore = useCallback((choreId: string, reason: ChoreSkippedReason, memberId?: string, note?: string) => {
    let created: ChoreCompletion | null = null;
    setData((current) => {
      const chore = current.chores.find((entry) => entry.id === choreId);
      if (!chore) return current;
      const actorId = memberId || current.settings.activeMemberId || chore.ownerMemberId;
      created = {
        id: makeId("completion"),
        choreId,
        memberId: actorId,
        completedAt: new Date().toISOString(),
        note: note?.trim() || "",
        skippedReason: reason,
        action: "skipped",
      };
      return {
        ...current,
        settings: { ...current.settings, activeMemberId: actorId },
        completions: [created, ...current.completions],
      };
    });
    return created;
  }, []);

  const updateChoreStatus = useCallback((choreId: string, status: ChoreStatus) => {
    setData((current) => ({
      ...current,
      chores: current.chores.map((chore) => (chore.id === choreId ? { ...chore, status, updatedAt: new Date().toISOString() } : chore)),
    }));
  }, []);

  const updateSettings = useCallback((settings: ChoreSettings) => {
    setData((current) => ({
      ...current,
      settings: {
        ...settings,
        conditionState: {
          ...settings.conditionState,
          daysSinceRain: Math.max(0, Number(settings.conditionState.daysSinceRain) || 0),
        },
      },
    }));
  }, []);

  const toggleBurstItem = useCallback((itemId: string, memberId?: string) => {
    setData((current) => ({
      ...current,
      settings: memberId ? { ...current.settings, activeMemberId: memberId } : current.settings,
      burstItems: current.burstItems.map((item) => (item.id === itemId ? { ...item, completedAt: item.completedAt ? undefined : new Date().toISOString() } : item)),
    }));
  }, []);

  const updateBurstItem = useCallback((itemId: string, input: BurstChecklistItemInput) => {
    setData((current) => ({
      ...current,
      burstItems: current.burstItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              title: input.title.trim() || "Checklist item",
              ownerMemberId: input.ownerMemberId,
              notes: input.notes || "",
              completedAt: input.completedAt,
            }
          : item,
      ),
    }));
  }, []);

  const addTemplate = useCallback((templateId: string) => {
    let count = 0;
    setData((current) => {
      const template = SEASON_TEMPLATES.find((entry) => entry.id === templateId);
      const owner = current.members.find((member) => member.role === "adult") || current.members[0];
      if (!template || !owner) return current;
      const now = new Date().toISOString();
      const chores: Chore[] = template.chores.map((entry) => {
        const id = makeId("chore");
        const params = entry.recurrenceType === "burst" ? withDefaultBurstWindow(entry.params as Partial<BurstRecurrenceParams>) : entry.params;
        return {
          id,
          title: entry.title,
          ownerMemberId: owner.id,
          recurrenceType: entry.recurrenceType,
          recurrenceParams: params as Chore["recurrenceParams"],
          location: entry.location || "",
          seasonWindow: template.title,
          effort: entry.effort,
          verification: "trust",
          howWeDoIt: entry.howWeDoIt || "",
          status: "active",
          createdAt: now,
          updatedAt: now,
        };
      });
      const burstItems = chores.flatMap((chore, index) => makeBurstItems(chore.id, (template.chores[index].items || []).map((title) => ({ title, ownerMemberId: owner.id, notes: "" })), owner.id));
      count = chores.length;
      return {
        ...current,
        chores: [...chores, ...current.chores],
        burstItems: [...burstItems, ...current.burstItems],
      };
    });
    return count;
  }, []);

  const value = useMemo<ChoresContextValue>(
    () => ({
      data,
      activeMember,
      setActiveMember,
      addMember,
      updateMember,
      deleteMember,
      addChore,
      updateChore,
      deleteChore,
      completeChore,
      skipChore,
      updateChoreStatus,
      updateSettings,
      toggleBurstItem,
      updateBurstItem,
      addTemplate,
    }),
    [data, activeMember, setActiveMember, addMember, updateMember, deleteMember, addChore, updateChore, deleteChore, completeChore, skipChore, updateChoreStatus, updateSettings, toggleBurstItem, updateBurstItem, addTemplate],
  );

  return <ChoresContext.Provider value={value}>{children}</ChoresContext.Provider>;
}

export function useChores(): ChoresContextValue {
  const context = useContext(ChoresContext);
  if (!context) throw new Error("useChores must be used inside ChoresProvider");
  return context;
}

export function useChore(choreId?: string): Chore | undefined {
  const { data } = useChores();
  return data.chores.find((chore) => chore.id === choreId);
}

function makeBurstItems(choreId: string, items: ChoreInput["burstItems"], defaultOwnerMemberId: string): BurstChecklistItem[] {
  return (items || [])
    .filter((item) => item.title.trim())
    .map((item) => ({
      id: item.id || makeId("burst-item"),
      choreId,
      title: item.title.trim(),
      ownerMemberId: item.ownerMemberId || defaultOwnerMemberId,
      completedAt: item.completedAt,
      notes: item.notes || "",
    }));
}

function withDefaultBurstWindow(params: Partial<BurstRecurrenceParams>): BurstRecurrenceParams {
  const start = params.windowStart || addDays(todayDate(), 14);
  return {
    windowStart: start,
    windowEnd: params.windowEnd || addDays(start, 2),
    block: params.block || "Anytime",
  };
}

function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}` : words[0]?.slice(0, 2);
  return (initials || "HM").toUpperCase();
}
