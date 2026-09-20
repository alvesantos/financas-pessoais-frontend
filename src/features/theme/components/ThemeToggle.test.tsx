import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../context/ThemeProvider";
import { THEME_STORAGE_KEY } from "../theme";
import { ThemeToggle } from "./ThemeToggle";

/** jsdom não implementa matchMedia; o teste decide o que o sistema prefere. */
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

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  stubSystemTheme(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ThemeToggle", () => {
  it("começa no tema do sistema quando a pessoa ainda não escolheu", () => {
    stubSystemTheme(true);

    renderToggle();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Usar tema claro" })).toBeInTheDocument();
  });

  it("alterna entre claro e escuro", async () => {
    const user = userEvent.setup();
    renderToggle();

    expect(document.documentElement.dataset.theme).toBe("light");

    await user.click(screen.getByRole("button", { name: "Usar tema escuro" }));
    expect(document.documentElement.dataset.theme).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Usar tema claro" }));
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("guarda a escolha", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole("button", { name: "Usar tema escuro" }));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("a escolha salva vence a preferência do sistema", () => {
    // Sistema no claro, escolha salva no escuro: a escolha manda.
    stubSystemTheme(false);
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    renderToggle();

    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("anuncia o estado para leitores de tela", async () => {
    const user = userEvent.setup();
    renderToggle();

    const botao = screen.getByRole("button", { name: "Usar tema escuro" });
    expect(botao).toHaveAttribute("aria-pressed", "false");

    await user.click(botao);
    expect(screen.getByRole("button", { name: "Usar tema claro" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("sobrevive ao localStorage bloqueado", async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });

    renderToggle();
    await user.click(screen.getByRole("button", { name: "Usar tema escuro" }));

    // Sem poder salvar, o tema ainda vale para esta aba.
    expect(document.documentElement.dataset.theme).toBe("dark");

    setItem.mockRestore();
  });
});
