import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../features/theme/context/ThemeProvider";
import { ThemeToggle } from "../../features/theme/components/ThemeToggle";
import { THEME_STORAGE_KEY } from "../../features/theme/theme";
import { Logo } from "./Logo";

function stubSystemTheme(prefersDark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: prefersDark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

function renderLogo() {
  return render(
    <ThemeProvider>
      <Logo />
      <ThemeToggle />
    </ThemeProvider>,
  );
}

/** O <img> é decorativo, então não tem papel nem nome acessível. */
function logoImage(): HTMLImageElement {
  return document.querySelector("img.logo") as HTMLImageElement;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  stubSystemTheme(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Logo", () => {
  it("usa o ladrilho escuro no tema claro", () => {
    renderLogo();

    expect(logoImage().getAttribute("src")).toBe("/mnemio-icon-dark.webp");
  });

  it("usa o ladrilho claro no tema escuro", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    renderLogo();

    expect(logoImage().getAttribute("src")).toBe("/mnemio-icon-light.webp");
  });

  it("troca de arquivo junto com o tema", async () => {
    const user = userEvent.setup();
    renderLogo();

    expect(logoImage().getAttribute("src")).toBe("/mnemio-icon-dark.webp");

    await user.click(screen.getByRole("button", { name: "Usar tema escuro" }));

    expect(logoImage().getAttribute("src")).toBe("/mnemio-icon-light.webp");
  });

  it("é decorativo: o nome do produto já está no texto ao lado", () => {
    renderLogo();

    expect(logoImage()).toHaveAttribute("alt", "");
    expect(logoImage()).toHaveAttribute("aria-hidden", "true");
  });
});
