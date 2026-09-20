import type { Frequency, Kind } from "../../types/finance";

/**
 * Um lançamento do mês. Quando vem projetado de um fixo, `projected` é true,
 * `id` é 0 e a origem está em `recurring_id`. Projeções não existem como
 * linha no banco e por isso não podem ser apagadas isoladamente.
 */
export interface Transaction {
  id: number;
  description: string;
  amount_cents: number;
  signed_cents: number;
  kind: Kind;
  kind_label: string;
  occurred_at: string;
  projected: boolean;
  recurring_id?: number;
  frequency?: Frequency;
  frequency_label?: string;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  paid: boolean;
  credit_card_id: number | null;
  credit_card_name: string | null;
  invoice_month: string | null;
  debt_id?: number;
  installment_number?: number;
  installments_total?: number;
  /** Id do fixo que originou a projeção. */
  recurring_origin_id?: number;
}

/** Marca uma ocorrência projetada como paga, gravando-a de verdade. */
export interface PayOccurrenceInput {
  origin: "fixo" | "divida";
  origin_id: number;
  occurred_at: string;
}

export interface MonthSummary {
  year: number;
  month: number;
  saldo_atual_cents: number;
  saldo_previsto_cents: number;
  receitas_cents: number;
  despesas_cents: number;
  quantidade: number;
}

export interface CreateTransactionInput {
  description: string;
  amount_cents: number;
  kind: Kind;
  occurred_at: string;
  category_id: number | null;
  paid: boolean;
  credit_card_id?: number | null;
  invoice?: "atual" | "proxima";
}
