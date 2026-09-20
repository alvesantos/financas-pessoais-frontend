import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../lib/api-error";
import { renderWithProviders, screen, waitFor } from "../../../test/render";
import { AuthForm } from "./AuthForm";

// A camada de API da feature é o limite do teste unitário.
vi.mock("../api/auth.api", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
}));

const { authApi } = await import("../api/auth.api");

const sessao = {
  token: "token-abc",
  expires_at: "2030-01-01T00:00:00Z",
  user: { id: 1, name: "Gabe", email: "gabe@teste.com" },
};

beforeEach(() => {
  vi.mocked(authApi.login).mockReset();
  vi.mocked(authApi.register).mockReset();
});

describe("AuthForm — entrar", () => {
  it("envia as credenciais digitadas", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue(sessao);

    renderWithProviders(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("E-mail"), "gabe@teste.com");
    await user.type(screen.getByLabelText("Senha"), "senha12345");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "gabe@teste.com",
        password: "senha12345",
      });
    });
  });

  it("não pede o nome no modo entrar", () => {
    renderWithProviders(<AuthForm mode="login" />);

    expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
  });

  it("mostra o erro geral quando a API não aponta campos", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(401, "e-mail ou senha incorretos", "unauthorized"),
    );

    renderWithProviders(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("E-mail"), "gabe@teste.com");
    await user.type(screen.getByLabelText("Senha"), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("e-mail ou senha incorretos");
  });

  it("desabilita o botão enquanto envia", async () => {
    const user = userEvent.setup();
    let liberar: (value: typeof sessao) => void = () => {};
    vi.mocked(authApi.login).mockReturnValue(
      new Promise((resolve) => {
        liberar = resolve;
      }),
    );

    renderWithProviders(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("E-mail"), "gabe@teste.com");
    await user.type(screen.getByLabelText("Senha"), "senha12345");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();

    liberar(sessao);
    await waitFor(() => expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled());
  });

  it("mostra a senha ao clicar em Mostrar", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AuthForm mode="login" />);

    const senha = screen.getByLabelText("Senha");
    expect(senha).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(senha).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(senha).toHaveAttribute("type", "password");
  });
});

describe("AuthForm — criar conta", () => {
  it("envia nome, e-mail e senha", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockResolvedValue(sessao);

    renderWithProviders(<AuthForm mode="register" />);

    await user.type(screen.getByLabelText("Nome"), "Gabe");
    await user.type(screen.getByLabelText("E-mail"), "gabe@teste.com");
    await user.type(screen.getByLabelText("Senha"), "senha12345");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        name: "Gabe",
        email: "gabe@teste.com",
        password: "senha12345",
      });
    });
  });

  it("coloca o erro de validação embaixo do campo correspondente", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockRejectedValue(
      new ApiError(422, "dados inválidos", "validation", {
        password: "a senha precisa de ao menos 8 caracteres",
      }),
    );

    renderWithProviders(<AuthForm mode="register" />);

    await user.type(screen.getByLabelText("Nome"), "Gabe");
    await user.type(screen.getByLabelText("E-mail"), "gabe@teste.com");
    await user.type(screen.getByLabelText("Senha"), "curta");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    const erro = await screen.findByText("a senha precisa de ao menos 8 caracteres");
    expect(erro).toBeInTheDocument();

    // O campo precisa apontar para o erro, não só exibi-lo ao lado.
    const senha = screen.getByLabelText("Senha");
    expect(senha).toHaveAttribute("aria-invalid", "true");
    expect(senha).toHaveAttribute("aria-describedby", erro.id);
  });

  it("guarda o token e libera a sessão no cadastro bem-sucedido", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockResolvedValue(sessao);

    renderWithProviders(<AuthForm mode="register" />);

    await user.type(screen.getByLabelText("Nome"), "Gabe");
    await user.type(screen.getByLabelText("E-mail"), "gabe@teste.com");
    await user.type(screen.getByLabelText("Senha"), "senha12345");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(localStorage.getItem("mnemio.token")).toBe("token-abc"));
  });
});
