import { httpClient } from "../../../lib/http-client";
import type { AmortizeInput, CreateDebtInput, Debt } from "../types";

/** Única camada que conhece as rotas de dívidas da API. */
export const debtsApi = {
  list: (signal?: AbortSignal) => httpClient.get<Debt[]>("/debts", { signal }),

  create: (input: CreateDebtInput) => httpClient.post<Debt>("/debts", { body: input }),

  update: (id: number, input: CreateDebtInput) =>
    httpClient.put<Debt>(`/debts/${id}`, { body: input }),

  amortize: (id: number, input: AmortizeInput) =>
    httpClient.post<Debt>(`/debts/${id}/amortize`, { body: input }),

  settle: (id: number, subtractFromBalance: boolean) =>
    httpClient.post<Debt>(`/debts/${id}/settle`, {
      body: { subtract_from_balance: subtractFromBalance },
    }),

  remove: (id: number) => httpClient.delete<void>(`/debts/${id}`),
};
