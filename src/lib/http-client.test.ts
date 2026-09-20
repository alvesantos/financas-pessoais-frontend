import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./api-error";
import { httpClient } from "./http-client";
import { tokenStorage } from "./token-storage";

/** Resposta mínima do fetch, suficiente para o cliente HTTP. */
function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  tokenStorage.clear();
});

describe("httpClient", () => {
  it("envia o token salvo no cabeçalho Authorization", async () => {
    tokenStorage.set("token-abc");
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 1 }));

    await httpClient.get("/auth/me");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get("Authorization")).toBe("Bearer token-abc");
  });

  it("não envia o token em rotas públicas", async () => {
    tokenStorage.set("token-abc");
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await httpClient.post("/auth/login", { body: { email: "a@b.com" }, auth: false });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get("Authorization")).toBeNull();
  });

  it("converte a resposta de erro em ApiError com os campos", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(422, {
        error: "dados inválidos",
        code: "validation",
        fields: { email: "e-mail inválido" },
      }),
    );

    await expect(httpClient.post("/auth/register", { body: {} })).rejects.toMatchObject({
      status: 422,
      code: "validation",
      fields: { email: "e-mail inválido" },
    });
  });

  it("converte falha de rede em ApiError de rede", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(httpClient.get("/auth/me")).rejects.toMatchObject({ code: "network" });
  });

  it("propaga o AbortError sem transformá-lo em falha de rede", async () => {
    // Quem cancelou precisa distinguir o cancelamento de um servidor fora do ar.
    fetchMock.mockRejectedValue(new DOMException("aborted", "AbortError"));

    await expect(httpClient.get("/auth/me")).rejects.toSatisfy(
      (error: unknown) => error instanceof DOMException && !(error instanceof ApiError),
    );
  });

  it("devolve undefined em 204 sem tentar ler o corpo", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 } as Response);

    await expect(httpClient.delete("/algo")).resolves.toBeUndefined();
  });
});
