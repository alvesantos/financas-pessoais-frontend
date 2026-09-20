import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpenseByKindChart } from "./ExpenseByKindChart";
import type { KindTotal } from "../types";

const gastos: KindTotal[] = [
  { kind: "despesa", label: "Despesa", total_cents: 90000 },
  { kind: "cartao_credito", label: "Gasto no cartão de crédito", total_cents: 50000 },
  { kind: "investimento", label: "Investimento", total_cents: 20000 },
];

describe("ExpenseByKindChart", () => {
  it("rotula cada barra e mostra o valor ao lado", () => {
    render(<ExpenseByKindChart data={gastos} />);

    // Uma série só: a identidade vem do rótulo, não da cor.
    expect(screen.getByText("Despesa")).toBeInTheDocument();
    expect(screen.getByText("Gasto no cartão de crédito")).toBeInTheDocument();
    expect(screen.getByText(/900,00/)).toBeInTheDocument();
  });

  it("mostra a fatia de cada tipo no total", () => {
    render(<ExpenseByKindChart data={gastos} />);

    // 90000 de 160000 = 56%
    expect(screen.getByText("56% dos gastos")).toBeInTheDocument();
  });

  it("mantém a ordem recebida, do maior para o menor", () => {
    render(<ExpenseByKindChart data={gastos} />);

    const rotulos = screen.getAllByText(/Despesa|Gasto no cartão|Investimento/);
    expect(rotulos[0]).toHaveTextContent("Despesa");
    expect(rotulos[2]).toHaveTextContent("Investimento");
  });

  it("explica o mês sem gastos", () => {
    render(<ExpenseByKindChart data={[]} />);

    expect(screen.getByText("Nenhum gasto neste mês.")).toBeInTheDocument();
  });
});
