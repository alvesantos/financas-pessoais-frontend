/** Códigos de erro devolvidos pela API, espelhando domain.ErrorCode no Go. */
export type ApiErrorCode =
  | "validation"
  | "invalid_payload"
  | "not_found"
  | "conflict"
  | "unauthorized"
  | "unavailable"
  | "internal"
  | "network";

/** Erros de validação por campo, como `{ email: "e-mail inválido" }`. */
export type FieldErrors = Record<string, string>;

export interface ApiErrorBody {
  error: string;
  code: ApiErrorCode;
  fields?: FieldErrors;
}

/** Erro normalizado de qualquer falha de API — inclusive rede fora do ar. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields: FieldErrors;

  constructor(status: number, message: string, code: ApiErrorCode, fields: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  /** true quando a API apontou campos específicos do formulário. */
  get hasFieldErrors(): boolean {
    return Object.keys(this.fields).length > 0;
  }

  get isUnauthorized(): boolean {
    return this.code === "unauthorized";
  }

  static network(): ApiError {
    return new ApiError(0, "Não foi possível conectar ao servidor.", "network");
  }

  static fromResponse(status: number, body: unknown): ApiError {
    const data = (body ?? {}) as Partial<ApiErrorBody>;

    return new ApiError(
      status,
      data.error ?? "Algo deu errado. Tente novamente.",
      data.code ?? "internal",
      data.fields ?? {},
    );
  }
}
