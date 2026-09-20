import { useTheme } from "../hooks/useTheme";
import "./ThemeToggle.css";

/** Alterna entre claro e escuro. O sol e a lua trocam de lugar girando. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? "Usar tema claro" : "Usar tema escuro"}
      aria-pressed={isDark}
      title={isDark ? "Tema claro" : "Tema escuro"}
    >
      <span className="theme-toggle-icons" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="theme-icon theme-icon-sun" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>

        <svg viewBox="0 0 24 24" className="theme-icon theme-icon-moon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
      </span>

      {!compact && <span className="sidebar-link-label">{isDark ? "Tema claro" : "Tema escuro"}</span>}
    </button>
  );
}
