import { httpClient } from "../../../lib/http-client";
import type { CreateRecurringInput, RecurringEntry } from "../types";

/** Única camada que conhece as rotas de lançamentos fixos da API. */
export const recurringApi = {
  list: (signal?: AbortSignal) => httpClient.get<RecurringEntry[]>("/recurring", { signal }),

  create: (input: CreateRecurringInput) =>
    httpClient.post<RecurringEntry>("/recurring", { body: input }),

  remove: (id: number) => httpClient.delete<void>(`/recurring/${id}`),
};
