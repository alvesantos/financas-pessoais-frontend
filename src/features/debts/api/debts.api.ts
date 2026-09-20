import { httpClient } from "../../../lib/http-client";
import type { CreateDebtInput, Debt } from "../types";

/** Única camada que conhece as rotas de dívidas da API. */
export const debtsApi = {
  list: (signal?: AbortSignal) => httpClient.get<Debt[]>("/debts", { signal }),

  create: (input: CreateDebtInput) => httpClient.post<Debt>("/debts", { body: input }),

  remove: (id: number) => httpClient.delete<void>(`/debts/${id}`),
};
