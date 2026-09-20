import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Icon, type IconName } from "../ui/Icon";
import { ThemeToggle } from "../../features/theme/components/ThemeToggle";
import { Logo } from "../ui/Logo";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { paths } from "../../routes/paths";
import "./AppShell.css";

const STORAGE_KEY = "mnemio.sidebar.collapsed";

const menu: { to: string; label: string; icon: IconName }[] = [
  { to: paths.dashboard, label: "Painel", icon: "painel" },
  { to: paths.transactions, label: "Lançamentos", icon: "lancamentos" },
  { to: paths.recurring, label: "Fixos", icon: "fixos" },
  { to: paths.categories, label: "Categorias", icon: "categorias" },
  { to: paths.debts, label: "Dívidas", icon: "dividas" },
];

/** Lê a preferência salva. Em aba anônima o acesso lança, daí o try/catch. */
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Moldura das telas autenticadas: menu lateral, marca e quem está logado. */
export function AppShell() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Preferência vale só para esta aba.
    }
  }, [collapsed]);

  return (
    <div className={`app-shell${collapsed ? " is-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo size={28} />
          <span className="sidebar-name">
            <strong>Mnemio</strong>
            <small>Finanças</small>
          </span>
        </div>

        <nav className="sidebar-nav" aria-label="Seções">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === paths.dashboard}
              className={({ isActive }) => (isActive ? "sidebar-link is-active" : "sidebar-link")}
              // Recolhido, o rótulo some da tela mas continua no title e no
              // nome acessível do link.
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} />
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle />

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
          >
            <Icon name={collapsed ? "expandir" : "recolher"} size={16} />
            <span className="sidebar-link-label">Recolher</span>
          </button>

          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.name}</span>
            <button type="button" className="link" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
