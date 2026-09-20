import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "../../../test/render";
import { LoginPage } from "./LoginPage";

vi.mock("../api/auth.api", () => ({
  authApi: { login: vi.fn(), register: vi.fn(), me: vi.fn() },
}));

describe("LoginPage", () => {
  it("começa no modo entrar", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Bem-vindo de volta" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
  });

  it("alterna para o cadastro e volta", async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Criar agora" }));
    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByRole("heading", { name: "Bem-vindo de volta" })).toBeInTheDocument();
  });

  it("limpa os campos ao trocar de modo", async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "gabe@teste.com");
    await user.click(screen.getByRole("button", { name: "Criar agora" }));

    // Trocar de modo não deve carregar o que foi digitado no anterior.
    expect(screen.getByLabelText("E-mail")).toHaveValue("");
  });
});
