import { describe, expect, it } from "vitest";
import { ApiError } from "./api-error";

describe("ApiError", () => {
  it("monta o erro a partir do corpo devolvido pela API", () => {
    const error = ApiError.fromResponse(422, {
      error: "dados inválidos",
      code: "validation",
      fields: { password: "a senha precisa de ao menos 8 caracteres" },
    });

    expect(error.status).toBe(422);
    expect(error.code).toBe("validation");
    expect(error.message).toBe("dados inválidos");
    expect(error.fields.password).toBe("a senha precisa de ao menos 8 caracteres");
    expect(error.hasFieldErrors).toBe(true);
  });

  it("usa uma mensagem genérica quando o corpo não veio", () => {
    const error = ApiError.fromResponse(500, null);

    expect(error.code).toBe("internal");
    expect(error.message).toBe("Algo deu errado. Tente novamente.");
    expect(error.hasFieldErrors).toBe(false);
  });

  it("reconhece falta de autorização", () => {
    const error = ApiError.fromResponse(401, { error: "token expirado", code: "unauthorized" });

    expect(error.isUnauthorized).toBe(true);
  });

  it("representa a falha de rede com status 0", () => {
    const error = ApiError.network();

    expect(error.status).toBe(0);
    expect(error.code).toBe("network");
  });
});
