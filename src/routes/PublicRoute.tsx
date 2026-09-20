import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { paths } from "./paths";

interface LocationState {
  from?: { pathname: string };
}

/** Rotas só para visitantes: quem já entrou não volta à tela de login. */
export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="route-loading" aria-busy="true" />;

  if (isAuthenticated) {
    const from = (location.state as LocationState | null)?.from?.pathname;
    return <Navigate to={from ?? paths.dashboard} replace />;
  }

  return <Outlet />;
}
