export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "mnemio.theme";

/** Lê a preferência salva. Em aba anônima o acesso lança, daí o try/catch. */
export function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Preferência vale só para esta aba.
  }
}

/** O tema do sistema, usado enquanto a pessoa não escolheu o dela. */
export function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** O tema em vigor é o escolhido, ou o do sistema. */
export function resolveTheme(): Theme {
  return readStoredTheme() ?? systemTheme();
}

/** O par de ícones da marca, escolhido pelo contraste com o fundo. */
export const themeIcons: Record<Theme, string> = {
  light: "/mnemio-icon-dark.webp",
  dark: "/mnemio-icon-light.webp",
};

/** Escreve o tema no <html>, que é de onde os tokens saem. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;

  // O favicon é trocado aqui e também pelo script em index.html, que roda
  // antes desta camada existir.
  const favicon = document.getElementById("favicon");
  if (favicon instanceof HTMLLinkElement) {
    favicon.href = themeIcons[theme];
  }
}
