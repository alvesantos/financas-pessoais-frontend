import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../lib/api-error";
import { renderWithProviders, screen, waitFor } from "../../../test/render";
import { TransactionForm } from "./TransactionForm";

vi.mock("../api/transactions.api", () => ({
  transactionsApi: { create: vi.fn(), listMonth: vi.fn(), summary: vi.fn(), remove: vi.fn() },
}));

vi.mock("../../recurring/api/recurring.api", () => ({
  recurringApi: { create: vi.fn(), list: vi.fn(), remove: vi.fn() },
}));

const { transactionsApi } = await import("../api/transactions.api");
const { recurringApi } = await import("../../recurring/api/recurring.api");

const criado = {
  id: 1,
  description: "Mercado",
  amount_cents: 15990,
  signed_cents: -15990,
  kind: "despesa" as const,
  kind_label: "Despesa",
  occurred_at: "2026-09-20",
  projected: false,
};

beforeEach(() => {
  vi.mocked(transactionsApi.create).mockReset().mockResolvedValue(criado);
  vi.mocked(recurringApi.create).mockReset();
});

async function preencherValor(user: ReturnType<typeof userEvent.setup>, valor: string) {
  await user.type(screen.getByLabelText("Valor"), valor);
}

describe("TransactionForm", () => {
  it("converte o valor digitado em centavos", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionForm defaultDate="2026-09-20" onCreated={vi.fn()} />);

    await preencherValor(user, "159,90");
    await user.click(screen.getByRole("button", { name: "Adicionar lançamento" }));

    await waitFor(() => {
      expect(transactionsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount_cents: 15990 }),
      );
    });
  });

  it("manda a descrição vazia e deixa o backend aplicar o nome do tipo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionForm defaultDate="2026-09-20" onCreated={vi.fn()} />);

    await preencherValor(user, "50");
    await user.click(screen.getByRole("button", { name: "Adicionar lançamento" }));

    await waitFor(() => {
      expect(transactionsApi.create).toHaveBeenCalledWith(expect.objectContaining({ description: "" }));
    });
  });

  it("recusa valor zerado sem chamar a API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionForm defaultDate="2026-09-20" onCreated={vi.fn()} />);

    await preencherValor(user, "0");
    await user.click(screen.getByRole("button", { name: "Adicionar lançamento" }));

    expect(await screen.findByText("informe um valor maior que zero")).toBeInTheDocument();
    expect(transactionsApi.create).not.toHaveBeenCalled();
  });

  it("permite escolher o tipo do lançamento", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionForm defaultDate="2026-09-20" onCreated={vi.fn()} />);

    await preencherValor(user, "100");
    await user.selectOptions(screen.getByLabelText("Tipo"), "receita");
    await user.click(screen.getByRole("button", { name: "Adicionar lançamento" }));

    await waitFor(() => {
      expect(transactionsApi.create).toHaveBeenCalledWith(expect.objectContaining({ kind: "receita" }));
    });
  });

  it("esconde a frequência até marcar que é fixo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionForm defaultDate="2026-09-20" onCreated={vi.fn()} />);

    expect(screen.queryByLabelText("Com que frequência")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("É um lançamento fixo"));

    expect(screen.getByLabelText("Com que frequência")).toBeInTheDocument();
  });

  it("marcado como fixo, grava a regra de recorrência em vez do lançamento", async () => {
    const user = userEvent.setup();
    vi.mocked(recurringApi.create).mockResolvedValue({
      id: 1,
      description: "Academia",
      amount_cents: 15990,
      kind: "despesa",
      kind_label: "Despesa",
      frequency: "mensal",
      frequency_label: "Mensal",
      start_date: "2026-09-20",
      end_date: null,
      active: true,
    });

    renderWithProviders(<TransactionForm defaultDate="2026-09-20" onCreated={vi.fn()} />);

    await preencherValor(user, "159,90");
    await user.type(screen.getByLabelText("Descrição (opcional)"), "Academia");
    await user.click(screen.getByLabelText("É um lançamento fixo"));
    await user.selectOptions(screen.getByLabelText("Com que frequência"), "mensal");
    await user.click(screen.getByRole("button", { name: "Criar lançamento fixo" }));

    await waitFor(() => {
      expect(recurringApi.create).toHaveBeenCalledWith({
        description: "Academia",
        amount_cents: 15990,
        kind: "despesa",
        frequency: "mensal",
        start_date: "2026-09-20",
      });
    });

    expect(transactionsApi.create).not.toHaveBeenCalled();
  });

  it("mostra o erro por campo devolvido pela API", async () => {
    const user = userEvent.setup();
    vi.mocked(transactionsApi.create).mockRejectedValue(
      new ApiError(422, "dados inválidos", "validation", { occurred_at: "informe uma data válida" }),
    );

    renderWithProviders(<TransactionForm defaultDate="2026-09-20" onCreated={vi.fn()} />);

    await preencherValor(user, "100");
    await user.click(screen.getByRole("button", { name: "Adicionar lançamento" }));

    expect(await screen.findByText("informe uma data válida")).toBeInTheDocument();
  });

  it("avisa quem chamou depois de criar", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    renderWithProviders(<TransactionForm defaultDate="2026-09-20" onCreated={onCreated} />);

    await preencherValor(user, "100");
    await user.click(screen.getByRole("button", { name: "Adicionar lançamento" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });
});
