import type { Frequency, Kind } from "../../types/finance";

/** Um lançamento fixo: a regra que projeta ocorrências nos meses. */
export interface RecurringEntry {
  id: number;
  description: string;
  amount_cents: number;
  kind: Kind;
  kind_label: string;
  frequency: Frequency;
  frequency_label: string;
  start_date: string;
  end_date: string | null;
  active: boolean;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
}

export interface CreateRecurringInput {
  description: string;
  amount_cents: number;
  kind: Kind;
  frequency: Frequency;
  start_date: string;
  end_date?: string | null;
  category_id: number | null;
}
