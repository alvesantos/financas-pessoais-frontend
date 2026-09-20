/** Um cartão de crédito da pessoa. */
export interface CreditCard {
  id: number;
  name: string;
  limit_cents: number;
  /** Dia a partir do qual a compra já cai na fatura seguinte. */
  best_purchase_day: number;
  due_day: number;
}

export interface CreditCardInput {
  name: string;
  limit_cents: number;
  best_purchase_day: number;
  due_day: number;
}

/** Em qual fatura a compra entra. */
export type InvoiceChoice = "atual" | "proxima";
