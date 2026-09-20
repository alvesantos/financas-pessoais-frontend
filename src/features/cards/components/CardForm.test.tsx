import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "../../../lib/api-error";
import { CardForm } from "./CardForm";
import type { CreditCard } from "../types";

vi.mock("../api/cards.api", () => ({
  cardsApi: { create: vi.fn(), update: vi.fn(), list: vi.fn(), remove: vi.fn() },
}));

const { cardsApi } = await import("../api/cards.api");

const cartao: CreditCard = {
  id: 3,
  name: "Nubank",
  limit_cents: 500000,
  best_purchase_day: 5,
  due_day: 15,
};

beforeEach(() => {
  vi.mocked(cardsApi.create).mockReset().mockResolvedValue(cartao);
  vi.mocked(cardsApi.update).mockReset().mockResolvedValue(cartao);
});

describe("CardForm", () => {
  it("cadastra com limite em centavos", async () => {
    const user = userEvent.setup();
    render(<CardForm onSaved={vi.fn()} />);

    await user.type(screen.getByLabelText("Nome do cartão"), "Nubank");
    await user.type(screen.getByLabelText("Limite"), "5000");
    await user.clear(screen.getByLabelText("Melhor dia para compras"));
    await user.type(screen.getByLabelText("Melhor dia para compras"), "5");
    await user.clear(screen.getByLabelText("Dia do vencimento"));
    await user.type(screen.getByLabelText("Dia do vencimento"), "15");
    await user.click(screen.getByRole("button", { name: "Adicionar cartão" }));

    await waitFor(() => {
      expect(cardsApi.create).toHaveBeenCalledWith({
        name: "Nubank",
        limit_cents: 500000,
        best_purchase_day: 5,
        due_day: 15,
      });
    });
  });

  it("em edição, abre preenchido e salva no cartão existente", async () => {
    const user = userEvent.setup();
    render(<CardForm editing={cartao} onSaved={vi.fn()} onCancelEdit={vi.fn()} />);

    expect(screen.getByLabelText("Nome do cartão")).toHaveValue("Nubank");
    expect(screen.getByLabelText("Melhor dia para compras")).toHaveValue(5);

    await user.clear(screen.getByLabelText("Nome do cartão"));
    await user.type(screen.getByLabelText("Nome do cartão"), "Nubank Ultra");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(cardsApi.update).toHaveBeenCalledWith(3, expect.objectContaining({ name: "Nubank Ultra" }));
    });
    expect(cardsApi.create).not.toHaveBeenCalled();
  });

  it("só oferece cancelar quando está editando", () => {
    const { rerender } = render(<CardForm onSaved={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();

    rerender(<CardForm editing={cartao} onSaved={vi.fn()} onCancelEdit={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("mostra o erro por campo devolvido pela API", async () => {
    const user = userEvent.setup();
    vi.mocked(cardsApi.create).mockRejectedValue(
      new ApiError(422, "dados inválidos", "validation", {
        best_purchase_day: "informe um dia entre 1 e 31",
      }),
    );

    render(<CardForm onSaved={vi.fn()} />);
    await user.type(screen.getByLabelText("Nome do cartão"), "Nubank");
    await user.click(screen.getByRole("button", { name: "Adicionar cartão" }));

    expect(await screen.findByText("informe um dia entre 1 e 31")).toBeInTheDocument();
  });

  it("nome repetido vira mensagem geral", async () => {
    const user = userEvent.setup();
    vi.mocked(cardsApi.create).mockRejectedValue(
      new ApiError(409, "já existe um cartão com esse nome", "conflict"),
    );

    render(<CardForm onSaved={vi.fn()} />);
    await user.type(screen.getByLabelText("Nome do cartão"), "Nubank");
    await user.click(screen.getByRole("button", { name: "Adicionar cartão" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("já existe um cartão");
  });
});
