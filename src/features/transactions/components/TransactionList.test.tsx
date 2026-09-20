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
  paid: true,
  credit_card_id: null,
  credit_card_name: null,
  invoice_month: null,
  category_id: 3,
  category_name: "Mercado",
  category_color: "#aabbcc",
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
  paid: true,
  credit_card_id: null,
  credit_card_name: null,
  invoice_month: null,
  recurring_id: 3,
  frequency: "mensal",
  frequency_label: "Mensal",
  category_id: null,
  category_name: null,
  category_color: null,
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
  paid: true,
  credit_card_id: null,
  credit_card_name: null,
  invoice_month: null,
  category_id: null,
  category_name: null,
  category_color: null,
};

const parcela: Transaction = {
  id: 0,
  description: "Empréstimo",
  amount_cents: 87766,
  signed_cents: -87766,
  kind: "despesa",
  kind_label: "Despesa",
  occurred_at: "2026-12-07",
  projected: true,
  paid: false,
  credit_card_id: null,
  credit_card_name: null,
  invoice_month: null,
  category_id: null,
  category_name: null,
  category_color: null,
  debt_id: 4,
  installment_number: 3,
  installments_total: 21,
};

describe("TransactionList", () => {
  it("mostra o dia, a descrição e o tipo embaixo dela", () => {
    render(<TransactionList transactions={[avulso]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    expect(screen.getByText("05")).toBeInTheDocument();
    expect(screen.getByText(/Despesa/)).toBeInTheDocument();
  });

  it("mostra a categoria embaixo da descrição", () => {
    render(<TransactionList transactions={[avulso]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    // "Mercado" aqui é a categoria; a descrição do lançamento é a mesma
    // palavra, então a busca é pelo bloco de metadados.
    const meta = document.querySelector(".entry-meta");
    expect(meta).toHaveTextContent("Mercado");
    expect(meta).toHaveTextContent("Despesa");
  });

  it("linha sem categoria não inventa uma", () => {
    render(<TransactionList transactions={[receita]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    const meta = document.querySelector(".entry-meta");
    expect(meta).toHaveTextContent("Receita");
    expect(meta?.querySelector(".category-dot")).toBeNull();
  });

  it("marca a linha vinda de um fixo com a frequência", () => {
    render(<TransactionList transactions={[projetado]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    expect(screen.getByText("Academia")).toBeInTheDocument();
    expect(screen.getByText("Fixo mensal")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("não oferece apagar uma projeção, que não existe como linha", () => {
    render(<TransactionList transactions={[projetado]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /Apagar/ })).not.toBeInTheDocument();
  });

  it("apaga um lançamento avulso", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<TransactionList transactions={[avulso]} onDelete={onDelete} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Apagar Mercado" }));

    expect(onDelete).toHaveBeenCalledWith(avulso);
  });

  it("mostra receita somando e despesa subtraindo", () => {
    render(<TransactionList transactions={[receita, avulso]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    expect(screen.getByText(/\+.*5\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/-.*85,50/)).toBeInTheDocument();
  });

  it("marca a linha vinda de uma dívida com o número da parcela", () => {
    render(<TransactionList transactions={[parcela]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    expect(screen.getByText("Parcela 3/21")).toBeInTheDocument();
  });

  it("não oferece apagar uma parcela, que não existe como linha", () => {
    render(<TransactionList transactions={[parcela]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /Apagar/ })).not.toBeInTheDocument();
  });

  it("marca o que ainda não foi pago", () => {
    render(
      <TransactionList
        transactions={[{ ...avulso, paid: false }]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onMarkPaid={vi.fn()}
      />,
    );

    expect(screen.getByText("A pagar")).toBeInTheDocument();
  });

  it("uma receita pendente é a receber, não a pagar", () => {
    render(
      <TransactionList
        transactions={[{ ...receita, paid: false }]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onMarkPaid={vi.fn()}
      />,
    );

    expect(screen.getByText("A receber")).toBeInTheDocument();
  });

  it("oferece editar um lançamento avulso", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<TransactionList transactions={[avulso]} onDelete={vi.fn()} onEdit={onEdit} onMarkPaid={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Editar Mercado" }));

    expect(onEdit).toHaveBeenCalledWith(avulso);
  });

  it("oferece marcar como pago só no que está pendente", async () => {
    const user = userEvent.setup();
    const onMarkPaid = vi.fn();
    const pendente = { ...avulso, paid: false };

    render(
      <TransactionList transactions={[pendente]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={onMarkPaid} />,
    );

    await user.click(screen.getByRole("button", { name: "Marcar Mercado como pago" }));

    expect(onMarkPaid).toHaveBeenCalledWith(pendente);
  });

  it("o que já foi pago não mostra o botão", () => {
    render(
      <TransactionList transactions={[avulso]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />,
    );

    expect(screen.queryByRole("button", { name: /Marcar/ })).not.toBeInTheDocument();
  });

  it("numa receita pendente o botão fala em receber", () => {
    render(
      <TransactionList
        transactions={[{ ...receita, paid: false }]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onMarkPaid={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Marcar Salário como recebido" }),
    ).toBeInTheDocument();
  });

  it("explica o estado vazio em vez de só mostrar nada", () => {
    render(<TransactionList transactions={[]} onDelete={vi.fn()} onEdit={vi.fn()} onMarkPaid={vi.fn()} />);

    expect(screen.getByText("Nenhum lançamento neste mês")).toBeInTheDocument();
  });
});
