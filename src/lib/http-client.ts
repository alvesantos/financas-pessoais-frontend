import { ApiError } from "./api-error";
import { tokenStorage } from "./token-storage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

interface RequestOptions {
  body?: unknown;
  signal?: AbortSignal;
  /** Rotas públicas não precisam mandar o Authorization. */
  auth?: boolean;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, signal, auth = true } = options;

  const headers = new Headers();
  if (body !== undefined) headers.set("Content-Type", "application/json");

  if (auth) {
    const token = tokenStorage.get();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    // AbortError não é falha de rede: quem cancelou trata o descarte.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw ApiError.network();
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) throw ApiError.fromResponse(response.status, payload);

  return payload as T;
}

/** Cliente HTTP único da aplicação: só ele conhece a URL base e o token. */
export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
  put: <T>(path: string, options?: RequestOptions) => request<T>("PUT", path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>("PATCH", path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};
