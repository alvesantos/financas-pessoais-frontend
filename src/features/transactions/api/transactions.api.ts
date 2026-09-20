import { httpClient } from "../../../lib/http-client";
import type { CreateTransactionInput, MonthSummary, Transaction } from "../types";

function monthQuery(year: number, month: number): string {
  return `year=${year}&month=${month}`;
}

/** Única camada que conhece as rotas de lançamentos da API. */
export const transactionsApi = {
  listMonth: (year: number, month: number, signal?: AbortSignal) =>
    httpClient.get<Transaction[]>(`/transactions?${monthQuery(year, month)}`, { signal }),

  summary: (year: number, month: number, signal?: AbortSignal) =>
    httpClient.get<MonthSummary>(`/transactions/summary?${monthQuery(year, month)}`, { signal }),

  create: (input: CreateTransactionInput) =>
    httpClient.post<Transaction>("/transactions", { body: input }),

  update: (id: number, input: CreateTransactionInput) =>
    httpClient.put<Transaction>(`/transactions/${id}`, { body: input }),

  remove: (id: number) => httpClient.delete<void>(`/transactions/${id}`),
};
