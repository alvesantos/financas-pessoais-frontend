import { httpClient } from "../../../lib/http-client";
import type { Category, CreateCategoryInput } from "../types";

/** Única camada que conhece as rotas de categorias da API. */
export const categoriesApi = {
  list: (signal?: AbortSignal) => httpClient.get<Category[]>("/categories", { signal }),

  create: (input: CreateCategoryInput) =>
    httpClient.post<Category>("/categories", { body: input }),

  update: (id: number, input: CreateCategoryInput) =>
    httpClient.put<Category>(`/categories/${id}`, { body: input }),

  remove: (id: number) => httpClient.delete<void>(`/categories/${id}`),
};
