import { AppHeader } from "../../../components/layout/AppHeader";
import { useAuth } from "../../auth/hooks/useAuth";
import "./DashboardPage.css";

/** Placeholder pós-login: a base para contas, categorias e lançamentos. */
export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="app-shell">
      <AppHeader />

      <main className="app-main">
        <h1>Olá, {firstName}.</h1>
        <p>Sua conta está pronta. Os próximos passos são contas, categorias e lançamentos.</p>
      </main>
    </div>
  );
}
