import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SettleDialog } from "./SettleDialog";
import type { Debt } from "../types";

vi.mock("../api/debts.api", () => ({
  debtsApi: { settle: vi.fn(), amortize: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const { debtsApi } = await import("../api/debts.api");

const divida = {
  id: 4,
  description: "Empréstimo",
  progress: { remaining_cents: 965426, remaining_count: 11, settled: false },
} as Debt;

beforeEach(() => {
  vi.mocked(debtsApi.settle).mockReset().mockResolvedValue(divida);
});

describe("SettleDialog", () => {
  it("começa perguntando se a dívida foi quitada", () => {
    render(<SettleDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText("Quitar dívida")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sim, foi quitada" })).toBeInTheDocument();
  });

  it("depois do sim, pergunta sobre o saldo", async () => {
    const user = userEvent.setup();
    render(<SettleDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Sim, foi quitada" }));

    expect(screen.getByText("Descontar do saldo?")).toBeInTheDocument();
    // A primeira pergunta sozinha não quita nada.
    expect(debtsApi.settle).not.toHaveBeenCalled();
  });

  it("quita descontando do saldo", async () => {
    const user = userEvent.setup();
    render(<SettleDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Sim, foi quitada" }));
    await user.click(screen.getByRole("button", { name: "Sim, descontar" }));

    await waitFor(() => expect(debtsApi.settle).toHaveBeenCalledWith(4, true));
  });

  it("quita sem mexer no saldo", async () => {
    const user = userEvent.setup();
    render(<SettleDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Sim, foi quitada" }));
    await user.click(screen.getByRole("button", { name: "Não, só quitar" }));

    await waitFor(() => expect(debtsApi.settle).toHaveBeenCalledWith(4, false));
  });

  it("responder não na primeira pergunta fecha sem quitar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SettleDialog debt={divida} onDone={vi.fn()} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Não" }));

    expect(onClose).toHaveBeenCalled();
    expect(debtsApi.settle).not.toHaveBeenCalled();
  });

  it("sem dívida, não renderiza nada", () => {
    const { container } = render(<SettleDialog debt={null} onDone={vi.fn()} onClose={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
