import type { Frequency, Kind } from "../../types/finance";

/** A caminhada até a quitação, calculada no backend. */
export interface DebtProgress {
  total_cents: number;
  paid_cents: number;
  remaining_cents: number;
  paid_count: number;
  remaining_count: number;
  /** De 0 a 100, arredondado para baixo. */
  percent: number;
  next_due_date: string | null;
  final_due_date: string;
  settled: boolean;
}

/** Uma dívida parcelada: empréstimo, acordo, compra em muitas vezes. */
export interface Debt {
  id: number;
  description: string;
  installment_amount_cents: number;
  installments: number;
  kind: Kind;
  kind_label: string;
  frequency: Frequency;
  frequency_label: string;
  first_due_date: string;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  progress: DebtProgress;
}

export interface CreateDebtInput {
  description: string;
  installment_amount_cents: number;
  installments: number;
  kind: Kind;
  frequency: Frequency;
  first_due_date: string;
  category_id: number | null;
}

/** Agregado de todas as dívidas, mostrado no painel. */
export interface DebtsSummary {
  total_cents: number;
  paid_cents: number;
  remaining_cents: number;
  open_count: number;
  settled_count: number;
  percent: number;
}
