import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { PublicRoute } from "../routes/PublicRoute";
import { paths } from "../routes/paths";

export function AppRoutes() {
  return (
    <Routes>
      {/* Livres de autenticação */}
      <Route element={<PublicRoute />}>
        <Route path={paths.login} element={<LoginPage />} />
      </Route>

      {/* Exigem sessão válida */}
      <Route element={<ProtectedRoute />}>
        <Route path={paths.dashboard} element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to={paths.dashboard} replace />} />
    </Routes>
  );
}
