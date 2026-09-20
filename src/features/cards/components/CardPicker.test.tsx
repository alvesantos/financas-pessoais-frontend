import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CardPicker } from "./CardPicker";

vi.mock("../api/cards.api", () => ({
  cardsApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const { cardsApi } = await import("../api/cards.api");

const nubank = { id: 1, name: "Nubank", limit_cents: 500000, best_purchase_day: 5, due_day: 15 };
const inter = { id: 2, name: "Inter", limit_cents: 300000, best_purchase_day: 3, due_day: 10 };

beforeEach(() => {
  vi.mocked(cardsApi.list).mockReset();
});

describe("CardPicker", () => {
  it("com um cartão só, já marca ele", async () => {
    vi.mocked(cardsApi.list).mockResolvedValue([nubank]);
    const onCardChange = vi.fn();

    render(
      <CardPicker cardId={null} invoice="atual" onCardChange={onCardChange} onInvoiceChange={vi.fn()} />,
    );

    // Não faz sentido pedir uma escolha que tem uma resposta só.
    await waitFor(() => expect(onCardChange).toHaveBeenCalledWith(1));
  });

  it("com mais de um, deixa a escolha em aberto", async () => {
    vi.mocked(cardsApi.list).mockResolvedValue([nubank, inter]);
    const onCardChange = vi.fn();

    render(
      <CardPicker cardId={null} invoice="atual" onCardChange={onCardChange} onInvoiceChange={vi.fn()} />,
    );

    await waitFor(() => expect(screen.getByText("Nubank")).toBeInTheDocument());
    expect(screen.getByText("Inter")).toBeInTheDocument();
    expect(onCardChange).not.toHaveBeenCalled();
  });

  it("oferece a fatura atual e a próxima", async () => {
    vi.mocked(cardsApi.list).mockResolvedValue([nubank, inter]);

    render(
      <CardPicker cardId={1} invoice="atual" onCardChange={vi.fn()} onInvoiceChange={vi.fn()} />,
    );

    await waitFor(() => expect(screen.getByLabelText("Entra em")).toBeInTheDocument());
    expect(screen.getByText("Fatura atual")).toBeInTheDocument();
    expect(screen.getByText("Próxima fatura")).toBeInTheDocument();
  });

  it("sem cartão cadastrado, explica em vez de mostrar um campo vazio", async () => {
    vi.mocked(cardsApi.list).mockResolvedValue([]);

    render(
      <CardPicker cardId={null} invoice="atual" onCardChange={vi.fn()} onInvoiceChange={vi.fn()} />,
    );

    expect(await screen.findByText(/Nenhum cartão cadastrado ainda/)).toBeInTheDocument();
  });
});
