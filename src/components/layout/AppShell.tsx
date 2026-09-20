import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { paths } from "../../routes/paths";
import "./AppShell.css";

const menu = [
  { to: paths.dashboard, label: "Painel" },
  { to: paths.transactions, label: "Lançamentos" },
  { to: paths.recurring, label: "Fixos" },
];

/** Moldura das telas autenticadas: marca, menu e quem está logado. */
export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <Logo size={28} />
          <span className="app-name">
            <strong>Finn</strong>
            <small>Finanças Pessoais</small>
          </span>
        </div>

        <nav className="app-nav" aria-label="Seções">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === paths.dashboard}
              className={({ isActive }) => (isActive ? "app-nav-link is-active" : "app-nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-header-user">
          <span className="app-user-name">{user?.name}</span>
          <button type="button" className="link" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
