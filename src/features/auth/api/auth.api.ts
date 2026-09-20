import { httpClient } from "../../../lib/http-client";
import type { LoginInput, RegisterInput, Session, User } from "../types";

/** Única camada que conhece as rotas de autenticação da API. */
export const authApi = {
  login: (input: LoginInput) =>
    httpClient.post<Session>("/auth/login", { body: input, auth: false }),

  register: (input: RegisterInput) =>
    httpClient.post<Session>("/auth/register", { body: input, auth: false }),

  me: (signal?: AbortSignal) => httpClient.get<User>("/auth/me", { signal }),
};
