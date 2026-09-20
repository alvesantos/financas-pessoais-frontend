const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Exibido no lugar de um valor que não chegou, em vez de "R$ NaN". */
export const MISSING_VALUE = "Indisponível";

/**
 * Formata centavos como moeda: 15990 vira "R$ 159,90".
 *
 * Um valor ausente vira um aviso, nunca "R$ 0,00": afirmar saldo zero quando
 * o número não chegou seria mentir sobre o dinheiro da pessoa.
 */
export function formatMoney(cents: number): string {
  if (!Number.isFinite(cents)) return MISSING_VALUE;

  return formatter.format(cents / 100);
}

/** Como formatMoney, mas com sinal explícito à frente dos positivos. */
export function formatSignedMoney(cents: number): string {
  if (!Number.isFinite(cents)) return MISSING_VALUE;

  const formatted = formatMoney(Math.abs(cents));
  return cents < 0 ? `- ${formatted}` : `+ ${formatted}`;
}

/**
 * Converte o que a pessoa digitou em centavos. Aceita "159,90", "159.90",
 * "1.599,90" e "R$ 159,90". Devolve null quando não dá para entender.
 */
export function parseMoneyToCents(input: string): number | null {
  const cleaned = input.replace(/[^\d,.-]/g, "").trim();
  if (cleaned === "") return null;

  // Com os dois separadores, o último é o decimal e o outro é milhar.
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized: string;
  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;

  // Arredonda para não herdar o erro do ponto flutuante nos centavos.
  return Math.round(value * 100);
}
