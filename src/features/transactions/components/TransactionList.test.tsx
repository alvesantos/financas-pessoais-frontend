import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionList } from "./TransactionList";
import type { Transaction } from "../types";

const avulso: Transaction = {
  id: 7,
  description: "Mercado",
  amount_cents: 8550,
  signed_cents: -8550,
  kind: "despesa",
  kind_label: "Despesa",
  occurred_at: "2026-09-05",
  projected: false,
};

const projetado: Transaction = {
  id: 0,
  description: "Academia",
  amount_cents: 15990,
  signed_cents: -15990,
  kind: "despesa",
  kind_label: "Despesa",
  occurred_at: "2026-09-20",
  projected: true,
  recurring_id: 3,
  frequency: "mensal",
  frequency_label: "Mensal",
};

const receita: Transaction = {
  id: 9,
  description: "Salário",
  amount_cents: 500000,
  signed_cents: 500000,
  kind: "receita",
  kind_label: "Receita",
  occurred_at: "2026-09-01",
  projected: false,
};

describe("TransactionList", () => {
  it("mostra o dia, a descrição e o tipo embaixo dela", () => {
    render(<TransactionList transactions={[avulso]} onDelete={vi.fn()} />);

    expect(screen.getByText("Mercado")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();
    expect(screen.getByText(/Despesa/)).toBeInTheDocument();
  });

  it("marca a linha vinda de um fixo com a frequência", () => {
    render(<TransactionList transactions={[projetado]} onDelete={vi.fn()} />);

    expect(screen.getByText("Academia")).toBeInTheDocument();
    expect(screen.getByText("Fixo mensal")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("não oferece apagar uma projeção, que não existe como linha", () => {
    render(<TransactionList transactions={[projetado]} onDelete={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /Apagar/ })).not.toBeInTheDocument();
  });

  it("apaga um lançamento avulso", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<TransactionList transactions={[avulso]} onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: "Apagar Mercado" }));

    expect(onDelete).toHaveBeenCalledWith(avulso);
  });

  it("mostra receita somando e despesa subtraindo", () => {
    render(<TransactionList transactions={[receita, avulso]} onDelete={vi.fn()} />);

    expect(screen.getByText(/\+.*5\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/-.*85,50/)).toBeInTheDocument();
  });

  it("explica o estado vazio em vez de só mostrar nada", () => {
    render(<TransactionList transactions={[]} onDelete={vi.fn()} />);

    expect(screen.getByText("Nenhum lançamento neste mês")).toBeInTheDocument();
  });
});
