/**
 * Tipos do domínio financeiro, compartilhados entre as features. Espelham
 * domain.Kind e domain.Frequency no backend.
 */

export type Kind = "receita" | "despesa" | "cartao_credito" | "investimento";

export type Frequency =
  | "diario"
  | "semanal"
  | "quinzenal"
  | "mensal"
  | "semestral"
  | "anual";

/** Rótulo de cada tipo — é também a descrição padrão de um lançamento. */
export const kindLabels: Record<Kind, string> = {
  receita: "Receita",
  despesa: "Despesa",
  cartao_credito: "Gasto no cartão de crédito",
  investimento: "Investimento",
};

/** Versão curta, para caber em listas e botões. */
export const kindShortLabels: Record<Kind, string> = {
  receita: "Receita",
  despesa: "Despesa",
  cartao_credito: "Cartão",
  investimento: "Investimento",
};

/** Ordem em que os tipos aparecem na interface. */
export const allKinds: Kind[] = ["receita", "despesa", "cartao_credito", "investimento"];

export const frequencyLabels: Record<Frequency, string> = {
  diario: "Diário",
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
  semestral: "Semestral",
  anual: "Anual",
};

/** Do intervalo mais curto para o mais longo. */
export const allFrequencies: Frequency[] = [
  "diario",
  "semanal",
  "quinzenal",
  "mensal",
  "semestral",
  "anual",
];

/** Só receita soma saldo; os demais tipos subtraem. */
export function isIncome(kind: Kind): boolean {
  return kind === "receita";
}
