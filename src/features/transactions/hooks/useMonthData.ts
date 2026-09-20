import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../lib/api-error";
import { transactionsApi } from "../api/transactions.api";
import type { MonthSummary, Transaction } from "../types";

interface Loaded {
  /** Identifica de qual requisição estes dados vieram. */
  key: string;
  transactions: Transaction[];
  summary: MonthSummary | null;
  error: string;
}

const empty: Loaded = { key: "", transactions: [], summary: null, error: "" };

interface MonthData {
  transactions: Transaction[];
  summary: MonthSummary | null;
  loading: boolean;
  error: string;
  reload: () => void;
}

/**
 * Carrega os lançamentos e os saldos do mês. As duas chamadas andam juntas
 * porque a tela só faz sentido com as duas — mostrar uma sem a outra deixaria
 * a lista e o saldo discordando na tela.
 *
 * O estado de carregamento é derivado da comparação entre o mês pedido e o
 * mês que já chegou, em vez de um setState no começo do efeito: assim trocar
 * de mês não dispara uma renderização a mais.
 */
export function useMonthData(year: number, month: number): MonthData {
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<Loaded>(empty);

  const key = `${year}-${month}-${version}`;
  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      transactionsApi.listMonth(year, month, controller.signal),
      transactionsApi.summary(year, month, controller.signal),
    ])
      .then(([transactions, summary]) => {
        setLoaded({ key, transactions, summary, error: "" });
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;

        setLoaded({
          key,
          transactions: [],
          summary: null,
          error: caught instanceof ApiError ? caught.message : "Não foi possível carregar o mês.",
        });
      });

    return () => controller.abort();
  }, [year, month, key]);

  return {
    transactions: loaded.transactions,
    summary: loaded.summary,
    loading: loaded.key !== key,
    error: loaded.error,
    reload,
  };
}
