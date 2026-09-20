import { createContext } from "react";
import type { Theme } from "../theme";

export interface ThemeContextValue {
  theme: Theme;
  /** true quando o tema ainda acompanha o sistema. */
  followsSystem: boolean;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
