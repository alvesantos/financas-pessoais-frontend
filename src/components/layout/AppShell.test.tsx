import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders, screen } from "../../test/render";
import { AppShell } from "./AppShell";

vi.mock("../../features/auth/api/auth.api", () => ({
  authApi: { login: vi.fn(), register: vi.fn(), me: vi.fn() },
}));

const { authApi } = await import("../../features/auth/api/auth.api");

function renderShell() {
  return renderWithProviders(
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<p>conteúdo</p>} />
      </Route>
    </Routes>,
    { route: "/" },
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(authApi.me).mockReset();
});

describe("AppShell", () => {
  it("lista as quatro seções no menu lateral", async () => {
    renderShell();

    expect(await screen.findByRole("link", { name: "Painel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lançamentos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fixos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Categorias" })).toBeInTheDocument();
  });

  it("marca a seção aberta", async () => {
    renderShell();

    expect(await screen.findByRole("link", { name: "Painel" })).toHaveClass("is-active");
    expect(screen.getByRole("link", { name: "Fixos" })).not.toHaveClass("is-active");
  });

  it("recolhe e expande o menu", async () => {
    const user = userEvent.setup();
    renderShell();

    const recolher = await screen.findByRole("button", { name: "Recolher menu" });
    expect(recolher).toHaveAttribute("aria-expanded", "true");

    await user.click(recolher);

    const expandir = screen.getByRole("button", { name: "Expandir menu" });
    expect(expandir).toHaveAttribute("aria-expanded", "false");

    await user.click(expandir);
    expect(screen.getByRole("button", { name: "Recolher menu" })).toBeInTheDocument();
  });

  it("recolhido, os links continuam com nome acessível", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(await screen.findByRole("button", { name: "Recolher menu" }));

    // O rótulo sai da tela por clip, não por display:none — quem usa leitor
    // de tela continua distinguindo os itens.
    expect(screen.getByRole("link", { name: "Lançamentos" })).toBeInTheDocument();
  });

  it("lembra o menu recolhido entre visitas", async () => {
    const user = userEvent.setup();
    const { unmount } = renderShell();

    await user.click(await screen.findByRole("button", { name: "Recolher menu" }));
    unmount();

    renderShell();
    expect(await screen.findByRole("button", { name: "Expandir menu" })).toBeInTheDocument();
  });
});
