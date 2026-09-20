import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DebtMeter } from "./DebtMeter";
import type { DebtProgress } from "../types";

// O caso do enunciado, no meio do caminho: 10 de 21 parcelas vencidas.
const meio: DebtProgress = {
  total_cents: 1843086,
  paid_cents: 877660,
  remaining_cents: 965426,
  paid_count: 10,
  remaining_count: 11,
  percent: 47,
  next_due_date: "2027-08-07",
  final_due_date: "2028-06-07",
  settled: false,
};

const quitada: DebtProgress = {
  total_cents: 1843086,
  paid_cents: 1843086,
  remaining_cents: 0,
  paid_count: 21,
  remaining_count: 0,
  percent: 100,
  next_due_date: null,
  final_due_date: "2028-06-07",
  settled: true,
};

describe("DebtMeter", () => {
  it("conta as parcelas vencidas e o total", () => {
    render(<DebtMeter progress={meio} />);

    expect(screen.getByText("10 de 21 parcelas")).toBeInTheDocument();
    expect(screen.getByText("47%")).toBeInTheDocument();
  });

  it("mostra quanto já saiu e quanto falta em reais", () => {
    render(<DebtMeter progress={meio} />);

    expect(screen.getByText(/8\.776,60 de/)).toBeInTheDocument();
    expect(screen.getByText(/Faltam.*9\.654,26/)).toBeInTheDocument();
  });

  it("usa um progress de verdade, que anuncia o valor sozinho", () => {
    render(<DebtMeter progress={meio} />);

    // Nada de duas divs: o elemento nativo já é lido por leitor de tela.
    const barra = screen.getByRole("progressbar");
    expect(barra).toHaveAttribute("value", "877660");
    expect(barra).toHaveAttribute("max", "1843086");
    expect(barra).toHaveAccessibleName("47% da dívida já venceu");
  });

  it("diz Quitada quando não falta nada", () => {
    render(<DebtMeter progress={quitada} />);

    expect(screen.getByText("Quitada")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.queryByText(/Faltam/)).not.toBeInTheDocument();
  });

  it("no começo da dívida não finge progresso", () => {
    render(
      <DebtMeter
        progress={{ ...meio, paid_cents: 0, paid_count: 0, remaining_count: 21, percent: 0 }}
      />,
    );

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
  });
});
