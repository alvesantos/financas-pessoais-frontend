import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpenseByCategoryChart } from "./ExpenseByCategoryChart";
import type { CategoryTotal } from "../types";

const gastos: CategoryTotal[] = [
  { category_id: 1, label: "Mercado", color: "#aabbcc", total_cents: 80000 },
  { category_id: 2, label: "Transporte", color: "#ccbbaa", total_cents: 50000 },
  { category_id: null, label: "Sem categoria", color: "#94a3b8", total_cents: 30000 },
];

describe("ExpenseByCategoryChart", () => {
  it("rotula cada barra e mostra o valor ao lado", () => {
    render(<ExpenseByCategoryChart data={gastos} />);

    // Uma série só: a identidade vem do rótulo, não da cor.
    expect(screen.getByText("Mercado")).toBeInTheDocument();
    expect(screen.getByText("Transporte")).toBeInTheDocument();
    expect(screen.getByText(/800,00/)).toBeInTheDocument();
  });

  it("mostra a fatia de cada categoria no total", () => {
    render(<ExpenseByCategoryChart data={gastos} />);

    // 80000 de 160000 = 50%
    expect(screen.getByText("50% dos gastos")).toBeInTheDocument();
  });

  it("mantém a ordem recebida, do maior para o menor", () => {
    const { container } = render(<ExpenseByCategoryChart data={gastos} />);

    const rotulos = container.querySelectorAll(".ranked-bar-label");
    expect(rotulos[0]).toHaveTextContent("Mercado");
    expect(rotulos[2]).toHaveTextContent("Sem categoria");
  });

  it("traz o balde de quem ainda não tem categoria", () => {
    render(<ExpenseByCategoryChart data={gastos} />);

    expect(screen.getByText("Sem categoria")).toBeInTheDocument();
  });

  it("explica o mês sem gastos", () => {
    render(<ExpenseByCategoryChart data={[]} />);

    expect(screen.getByText("Nenhum gasto neste mês.")).toBeInTheDocument();
  });
});
