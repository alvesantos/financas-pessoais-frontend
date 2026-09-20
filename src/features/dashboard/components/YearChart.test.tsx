import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { YearChart } from "./YearChart";
import type { MonthTotals } from "../types";

function serie(preenchidos: Partial<Record<number, [number, number]>> = {}): MonthTotals[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const [receitas, despesas] = preenchidos[month] ?? [0, 0];

    return { month, receitas_cents: receitas, despesas_cents: despesas, saldo_cents: receitas - despesas };
  });
}

describe("YearChart", () => {
  it("traz legenda para as duas séries", () => {
    const { container } = render(<YearChart data={serie({ 9: [500000, 80000] })} year={2026} />);

    // Com duas séries a legenda é obrigatória: a cor sozinha não identifica.
    // O mesmo texto também aparece na tabela, por isso a busca é escopada.
    const legenda = container.querySelector(".chart-legend") as HTMLElement;

    expect(within(legenda).getByText("Receitas")).toBeInTheDocument();
    expect(within(legenda).getByText("Despesas")).toBeInTheDocument();
  });

  it("rotula todos os meses do ano", () => {
    render(<YearChart data={serie({ 9: [500000, 80000] })} year={2026} />);

    expect(screen.getAllByText("Jan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dez").length).toBeGreaterThan(0);
  });

  it("oferece os mesmos números em tabela", () => {
    render(<YearChart data={serie({ 9: [500000, 80000] })} year={2026} />);

    expect(screen.getByText("Ver os números")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("explica o ano sem movimentação em vez de desenhar um gráfico vazio", () => {
    render(<YearChart data={serie()} year={2026} />);

    expect(screen.getByText(/Sem movimentação em 2026/)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
