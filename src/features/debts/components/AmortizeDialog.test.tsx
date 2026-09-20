import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "../../../lib/api-error";
import { AmortizeDialog } from "./AmortizeDialog";
import type { Debt } from "../types";

vi.mock("../api/debts.api", () => ({
  debtsApi: { amortize: vi.fn(), settle: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const { debtsApi } = await import("../api/debts.api");

// Faltam R$ 9.654,26 em 11 parcelas.
const divida = {
  id: 4,
  description: "Empréstimo",
  progress: { remaining_cents: 965426, remaining_count: 11, settled: false },
} as Debt;

beforeEach(() => {
  vi.mocked(debtsApi.amortize).mockReset().mockResolvedValue(divida);
});

describe("AmortizeDialog", () => {
  it("mostra o que falta antes de amortizar", () => {
    render(<AmortizeDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText(/9\.654,26 em 11 parcelas/)).toBeInTheDocument();
  });

  it("atualiza o saldo previsto conforme a pessoa digita", async () => {
    const user = userEvent.setup();
    render(<AmortizeDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    await user.type(screen.getByLabelText("Quanto quer amortizar"), "1000");

    // 9.654,26 menos 1.000,00
    expect(screen.getByText(/8\.654,26/)).toBeInTheDocument();
  });

  it("envia o valor em centavos, mantendo a parcela por padrão", async () => {
    const user = userEvent.setup();
    render(<AmortizeDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    await user.type(screen.getByLabelText("Quanto quer amortizar"), "1000");
    await user.click(screen.getByRole("button", { name: "Amortizar" }));

    await waitFor(() => {
      expect(debtsApi.amortize).toHaveBeenCalledWith(4, {
        amount_cents: 100000,
        new_remaining_cents: null,
        mode: "manter_parcela",
        installments: null,
      });
    });
  });

  it("o novo saldo final informado manda no previsto", async () => {
    const user = userEvent.setup();
    render(<AmortizeDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    await user.type(screen.getByLabelText("Quanto quer amortizar"), "1000");
    await user.type(screen.getByLabelText("Novo saldo final (opcional)"), "5000");

    expect(screen.getByText(/5\.000,00/)).toBeInTheDocument();
  });

  it("pede quantas parcelas só no modo que precisa disso", async () => {
    const user = userEvent.setup();
    render(<AmortizeDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByLabelText("Quantas parcelas ficam")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("E as parcelas"), "recalcular_parcelas");

    expect(screen.getByLabelText("Quantas parcelas ficam")).toBeInTheDocument();
  });

  it("recusa valor zerado sem chamar a API", async () => {
    const user = userEvent.setup();
    render(<AmortizeDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Amortizar" }));

    expect(await screen.findByText("informe um valor maior que zero")).toBeInTheDocument();
    expect(debtsApi.amortize).not.toHaveBeenCalled();
  });

  it("mostra o erro por campo devolvido pela API", async () => {
    const user = userEvent.setup();
    vi.mocked(debtsApi.amortize).mockRejectedValue(
      new ApiError(422, "dados inválidos", "validation", {
        amount_cents: "o valor passa do que falta pagar",
      }),
    );

    render(<AmortizeDialog debt={divida} onDone={vi.fn()} onClose={vi.fn()} />);
    await user.type(screen.getByLabelText("Quanto quer amortizar"), "99999");
    await user.click(screen.getByRole("button", { name: "Amortizar" }));

    expect(await screen.findByText("o valor passa do que falta pagar")).toBeInTheDocument();
  });
});
