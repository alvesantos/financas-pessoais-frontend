import type { Transaction } from "../transactions/types";
import type { MonthSummary } from "../transactions/types";

export interface YearTotals {
  year: number;
  receitas_cents: number;
  despesas_cents: number;
  saldo_cents: number;
}

/** Um ponto da série mensal do gráfico anual. */
export interface MonthTotals {
  month: number;
  receitas_cents: number;
  despesas_cents: number;
  saldo_cents: number;
}

/** Uma barra do gráfico de composição dos gastos. */
export interface KindTotal {
  kind: string;
  label: string;
  total_cents: number;
}

export interface Dashboard {
  year: YearTotals;
  month: MonthSummary;
  por_mes: MonthTotals[];
  gastos_por_tipo: KindTotal[];
  maior_gasto: Transaction | null;
}
