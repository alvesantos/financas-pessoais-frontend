import { httpClient } from "../../../lib/http-client";
import type { CreditCard, CreditCardInput } from "../types";

/** Única camada que conhece as rotas de cartões da API. */
export const cardsApi = {
  list: (signal?: AbortSignal) => httpClient.get<CreditCard[]>("/cards", { signal }),

  create: (input: CreditCardInput) => httpClient.post<CreditCard>("/cards", { body: input }),

  update: (id: number, input: CreditCardInput) =>
    httpClient.put<CreditCard>(`/cards/${id}`, { body: input }),

  remove: (id: number) => httpClient.delete<void>(`/cards/${id}`),
};
