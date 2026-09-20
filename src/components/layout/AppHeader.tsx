import { Logo } from "../ui/Logo";
import { useAuth } from "../../features/auth/hooks/useAuth";
import "./AppHeader.css";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <Logo size={28} />
        <strong>Finanças</strong>
      </div>

      <div className="app-header-user">
        <span>{user?.name}</span>
        <button type="button" className="link" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
}
