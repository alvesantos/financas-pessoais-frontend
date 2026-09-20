import { describe, expect, it } from "vitest";
import { dayOfISO, formatDayMonth, monthName, nextMonth, previousMonth } from "./dates";

describe("dates", () => {
  it("nomeia o mês pelo número da API", () => {
    expect(monthName(1)).toBe("Janeiro");
    expect(monthName(9)).toBe("Setembro");
    expect(monthName(12)).toBe("Dezembro");
  });

  it("lê o dia sem passar pelo fuso do navegador", () => {
    // new Date("2026-09-20") vira dia 19 em fusos a oeste de Greenwich.
    expect(dayOfISO("2026-09-20")).toBe(20);
  });

  it("formata dia e mês", () => {
    expect(formatDayMonth("2026-09-20")).toBe("20/09");
  });

  it("vira o ano ao passar de dezembro para janeiro", () => {
    expect(nextMonth(2026, 12)).toEqual([2027, 1]);
    expect(nextMonth(2026, 9)).toEqual([2026, 10]);
  });

  it("vira o ano ao voltar de janeiro para dezembro", () => {
    expect(previousMonth(2026, 1)).toEqual([2025, 12]);
    expect(previousMonth(2026, 9)).toEqual([2026, 8]);
  });
});
