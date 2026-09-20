import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { paths } from "./paths";

/** Bloqueia rotas privadas até a sessão ser restaurada e validada. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="route-loading" aria-busy="true" />;

  // Guarda a origem para devolver o usuário ao destino depois do login.
  if (!isAuthenticated) {
    return <Navigate to={paths.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
