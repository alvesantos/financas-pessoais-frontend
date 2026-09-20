import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders, screen } from "../test/render";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { paths } from "./paths";

vi.mock("../features/auth/api/auth.api", () => ({
  authApi: { login: vi.fn(), register: vi.fn(), me: vi.fn() },
}));

const { authApi } = await import("../features/auth/api/auth.api");

const usuario = { id: 1, name: "Gabe", email: "gabe@teste.com" };

function renderRotas(route: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path={paths.login} element={<p>tela de login</p>} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path={paths.dashboard} element={<p>painel privado</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

beforeEach(() => {
  vi.mocked(authApi.me).mockReset();
});

describe("guardas de rota", () => {
  it("manda visitante para o login ao tentar a rota privada", async () => {
    renderRotas(paths.dashboard);

    expect(await screen.findByText("tela de login")).toBeInTheDocument();
    expect(screen.queryByText("painel privado")).not.toBeInTheDocument();
  });

  it("libera a rota privada quando o token salvo é válido", async () => {
    localStorage.setItem("financas.token", "token-abc");
    vi.mocked(authApi.me).mockResolvedValue(usuario);

    renderRotas(paths.dashboard);

    expect(await screen.findByText("painel privado")).toBeInTheDocument();
  });

  it("descarta o token que a API recusa e volta ao login", async () => {
    localStorage.setItem("financas.token", "token-expirado");
    vi.mocked(authApi.me).mockRejectedValue(new Error("401"));

    renderRotas(paths.dashboard);

    expect(await screen.findByText("tela de login")).toBeInTheDocument();
    expect(localStorage.getItem("financas.token")).toBeNull();
  });

  it("tira do login quem já tem sessão", async () => {
    localStorage.setItem("financas.token", "token-abc");
    vi.mocked(authApi.me).mockResolvedValue(usuario);

    renderRotas(paths.login);

    expect(await screen.findByText("painel privado")).toBeInTheDocument();
  });
});
