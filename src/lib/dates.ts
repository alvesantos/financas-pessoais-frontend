export const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const monthNamesShort = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

/** Nome do mês a partir do número 1–12 usado pela API. */
export function monthName(month: number): string {
  return monthNames[month - 1] ?? "";
}

export function monthNameShort(month: number): string {
  return monthNamesShort[month - 1] ?? "";
}

/** Data de hoje no formato que a API espera (YYYY-MM-DD). */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Dia do mês de uma data ISO, sem passar pelo fuso do navegador. */
export function dayOfISO(iso: string): number {
  return Number(iso.slice(8, 10));
}

/** Formata "2026-09-20" como "20/09". */
export function formatDayMonth(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

/** Mês seguinte, cuidando da virada de ano. */
export function nextMonth(year: number, month: number): [number, number] {
  return month === 12 ? [year + 1, 1] : [year, month + 1];
}

/** Mês anterior, cuidando da virada de ano. */
export function previousMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}
