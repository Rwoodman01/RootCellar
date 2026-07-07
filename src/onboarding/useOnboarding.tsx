import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ensureOnboardingState,
  loadRootcellarData,
  saveRootcellarData,
  type OnboardingHouseholdBasicsDraft,
  type OnboardingRoomId,
  type RootcellarOnboardingState,
} from "../shared/storage/rootcellarStorage";

interface OnboardingContextValue {
  state: RootcellarOnboardingState;
  setStep: (step: RootcellarOnboardingState["step"]) => void;
  setSelectedRooms: (rooms: OnboardingRoomId[]) => void;
  setHouseholdBasics: (basics: OnboardingHouseholdBasicsDraft) => void;
  completeOnboarding: (kind: "finished" | "skipped") => void;
  dismissResumeBanner: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RootcellarOnboardingState>(() => loadRootcellarData().onboarding);

  useEffect(() => {
    const current = loadRootcellarData();
    saveRootcellarData({
      ...current,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      onboarding: state,
    });
  }, [state]);

  const setStep = useCallback((step: RootcellarOnboardingState["step"]) => {
    setState((current) => ({ ...current, step }));
  }, []);

  const setSelectedRooms = useCallback((rooms: OnboardingRoomId[]) => {
    setState((current) => ({ ...current, selectedRooms: rooms }));
  }, []);

  const setHouseholdBasics = useCallback((basics: OnboardingHouseholdBasicsDraft) => {
    setState((current) => ({ ...current, householdBasics: basics }));
  }, []);

  const completeOnboarding = useCallback((kind: "finished" | "skipped") => {
    const now = new Date().toISOString();
    setState((current) => ({ ...current, hasCompletedOnboarding: true, completionKind: kind, completedAt: now }));
    const currentData = loadRootcellarData();
    saveRootcellarData({
      ...currentData,
      householdProfile: {
        ...currentData.householdProfile,
        onboardingCompletedAt: currentData.householdProfile.onboardingCompletedAt || now,
      },
    });
  }, []);

  const dismissResumeBanner = useCallback(() => {
    setState((current) => ({ ...current, resumeBannerDismissed: true }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(ensureOnboardingState(undefined, undefined));
    const currentData = loadRootcellarData();
    saveRootcellarData({
      ...currentData,
      householdProfile: {
        ...currentData.householdProfile,
        onboardingCompletedAt: undefined,
      },
    });
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ state, setStep, setSelectedRooms, setHouseholdBasics, completeOnboarding, dismissResumeBanner, resetOnboarding }),
    [state, setStep, setSelectedRooms, setHouseholdBasics, completeOnboarding, dismissResumeBanner, resetOnboarding],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return context;
}
