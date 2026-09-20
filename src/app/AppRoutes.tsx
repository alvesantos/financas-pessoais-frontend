import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { RecurringPage } from "../features/recurring/pages/RecurringPage";
import { TransactionsPage } from "../features/transactions/pages/TransactionsPage";
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

      {/* Exigem sessão válida, e compartilham a moldura da aplicação */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={paths.dashboard} element={<DashboardPage />} />
          <Route path={paths.transactions} element={<TransactionsPage />} />
          <Route path={paths.recurring} element={<RecurringPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={paths.dashboard} replace />} />
    </Routes>
  );
}
