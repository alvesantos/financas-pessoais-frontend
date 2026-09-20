import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  systemTheme,
  type Theme,
} from "../theme";
import { ThemeContext } from "./theme-context";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // O script em index.html já aplicou o tema antes da primeira pintura;
  // aqui o estado apenas o acompanha.
  const [theme, setThemeState] = useState<Theme>(resolveTheme);
  const [followsSystem, setFollowsSystem] = useState(() => readStoredTheme() === null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Enquanto a pessoa não escolheu, o tema segue o sistema em tempo real.
  useEffect(() => {
    if (!followsSystem) return;

    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return;

    const onChange = () => setThemeState(systemTheme());
    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, [followsSystem]);

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next);
    setFollowsSystem(false);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      storeTheme(next);
      return next;
    });
    setFollowsSystem(false);
  }, []);

  const value = useMemo(
    () => ({ theme, followsSystem, toggle, setTheme }),
    [theme, followsSystem, toggle, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
