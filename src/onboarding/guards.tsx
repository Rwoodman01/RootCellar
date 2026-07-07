import { Navigate, Outlet } from "react-router-dom";
import { useOnboarding } from "./useOnboarding";

export function RootRedirect() {
  const { state } = useOnboarding();
  return <Navigate to={state.hasCompletedOnboarding ? "/daily-bread" : "/onboarding"} replace />;
}

export function RequireOnboarded() {
  const { state } = useOnboarding();
  if (!state.hasCompletedOnboarding) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
