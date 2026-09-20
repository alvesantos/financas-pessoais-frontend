import { httpClient } from "../../../lib/http-client";
import type { Dashboard } from "../types";

/** Única camada que conhece a rota do painel na API. */
export const dashboardApi = {
  overview: (year: number, month: number, signal?: AbortSignal) =>
    httpClient.get<Dashboard>(`/dashboard?year=${year}&month=${month}`, { signal }),
};
