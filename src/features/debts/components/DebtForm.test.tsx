import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "../../../lib/api-error";
import { DebtForm } from "./DebtForm";

vi.mock("../api/debts.api", () => ({
  debtsApi: { create: vi.fn(), list: vi.fn(), remove: vi.fn() },
}));

vi.mock("../../categories/api/categories.api", () => ({
  categoriesApi: { list: vi.fn().mockResolvedValue([]), create: vi.fn(), remove: vi.fn() },
}));

const { debtsApi } = await import("../api/debts.api");

const criada = {
  id: 1,
  description: "Empréstimo",
  installment_amount_cents: 87766,
  installments: 21,
  kind: "despesa" as const,
  kind_label: "Despesa",
  frequency: "mensal" as const,
  frequency_label: "Mensal",
  first_due_date: "2026-10-07",
  category_id: null,
  category_name: null,
  category_color: null,
  progress: {
    total_cents: 1843086,
    paid_cents: 0,
    remaining_cents: 1843086,
    paid_count: 0,
    remaining_count: 21,
    percent: 0,
    next_due_date: "2026-10-07",
    final_due_date: "2028-06-07",
    settled: false,
  },
};

beforeEach(() => {
  vi.mocked(debtsApi.create).mockReset().mockResolvedValue(criada);
});

/** Preenche o caso do enunciado: 21x de R$ 877,66 a partir de 07/10/2026. */
async function preencherEmprestimo(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("O que é"), "Empréstimo");
  await user.type(screen.getByLabelText("Valor da parcela"), "877,66");
  await user.clear(screen.getByLabelText("Quantas parcelas"));
  await user.type(screen.getByLabelText("Quantas parcelas"), "21");
  await user.clear(screen.getByLabelText("Primeira parcela"));
  await user.type(screen.getByLabelText("Primeira parcela"), "2026-10-07");
}

describe("DebtForm", () => {
  it("envia parcela em centavos e o número de parcelas", async () => {
    const user = userEvent.setup();
    render(<DebtForm onCreated={vi.fn()} />);

    await preencherEmprestimo(user);
    await user.click(screen.getByRole("button", { name: "Registrar dívida" }));

    await waitFor(() => {
      expect(debtsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Empréstimo",
          installment_amount_cents: 87766,
          installments: 21,
          frequency: "mensal",
          first_due_date: "2026-10-07",
        }),
      );
    });
  });

  it("mostra o total antes de registrar", async () => {
    const user = userEvent.setup();
    render(<DebtForm onCreated={vi.fn()} />);

    await preencherEmprestimo(user);

    // 877,66 x 21 = 18.430,86
    expect(screen.getByText(/18\.430,86/)).toBeInTheDocument();
  });

  it("só oferece os tipos que são saída", () => {
    render(<DebtForm onCreated={vi.fn()} />);

    const tipo = screen.getByLabelText("Tipo");
    expect(tipo).toHaveTextContent("Despesa");
    expect(tipo).toHaveTextContent("Gasto no cartão de crédito");
    // Dívida não é receita nem investimento.
    expect(tipo).not.toHaveTextContent("Receita");
    expect(tipo).not.toHaveTextContent("Investimento");
  });

  it("recusa parcela sem valor sem chamar a API", async () => {
    const user = userEvent.setup();
    render(<DebtForm onCreated={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Registrar dívida" }));

    expect(await screen.findByText("informe o valor da parcela")).toBeInTheDocument();
    expect(debtsApi.create).not.toHaveBeenCalled();
  });

  it("recusa zero parcelas sem chamar a API", async () => {
    const user = userEvent.setup();
    render(<DebtForm onCreated={vi.fn()} />);

    await user.type(screen.getByLabelText("Valor da parcela"), "100");
    await user.clear(screen.getByLabelText("Quantas parcelas"));
    await user.type(screen.getByLabelText("Quantas parcelas"), "0");
    await user.click(screen.getByRole("button", { name: "Registrar dívida" }));

    expect(await screen.findByText("informe quantas parcelas são")).toBeInTheDocument();
    expect(debtsApi.create).not.toHaveBeenCalled();
  });

  it("mostra o erro por campo devolvido pela API", async () => {
    const user = userEvent.setup();
    vi.mocked(debtsApi.create).mockRejectedValue(
      new ApiError(422, "dados inválidos", "validation", {
        installments: "o limite é de 600 parcelas",
      }),
    );

    render(<DebtForm onCreated={vi.fn()} />);
    await preencherEmprestimo(user);
    await user.click(screen.getByRole("button", { name: "Registrar dívida" }));

    expect(await screen.findByText("o limite é de 600 parcelas")).toBeInTheDocument();
  });

  it("avisa quem chamou depois de registrar", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    render(<DebtForm onCreated={onCreated} />);
    await preencherEmprestimo(user);
    await user.click(screen.getByRole("button", { name: "Registrar dívida" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });
});
