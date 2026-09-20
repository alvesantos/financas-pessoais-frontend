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

/** Quanto foi gasto em um tipo de lançamento. */
export interface KindTotal {
  kind: string;
  label: string;
  total_cents: number;
}

/**
 * Uma barra do gráfico de composição dos gastos. `category_id` nulo é o
 * balde de quem ainda não tem categoria.
 */
export interface CategoryTotal {
  category_id: number | null;
  label: string;
  color: string;
  total_cents: number;
}

export interface Dashboard {
  /** Acumulado de tudo que já foi pago e recebido, desde a primeira
   *  movimentação. Não é recortado por mês nem por ano. */
  saldo_atual_cents: number;
  /** O que os fixos de saída somam no mês: o custo de vida. */
  despesas_fixas_cents: number;
  year: YearTotals;
  month: MonthSummary;
  por_mes: MonthTotals[];
  gastos_por_tipo: KindTotal[];
  gastos_por_categoria: CategoryTotal[];
  maior_gasto: Transaction | null;
}
