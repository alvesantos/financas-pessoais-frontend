import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPage } from "./DashboardPage";
import type { Dashboard } from "../types";

vi.mock("../api/dashboard.api", () => ({ dashboardApi: { overview: vi.fn() } }));

const { dashboardApi } = await import("../api/dashboard.api");

const painel: Dashboard = {
  saldo_atual_cents: 750000,
  despesas_fixas_cents: 215990,
  year: { year: 2026, receitas_cents: 1000000, despesas_cents: 250000, saldo_cents: 750000 },
  month: {
    year: 2026,
    month: 9,
    saldo_atual_cents: 400000,
    saldo_previsto_cents: 300000,
    receitas_cents: 500000,
    despesas_cents: 200000,
    quantidade: 3,
  },
  por_mes: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    receitas_cents: 0,
    despesas_cents: 0,
    saldo_cents: 0,
  })),
  gastos_por_tipo: [{ kind: "despesa", label: "Despesa", total_cents: 200000 }],
  gastos_por_categoria: [
    { category_id: 1, label: "Mercado", color: "#aabbcc", total_cents: 200000 },
  ],
  maior_gasto: null,
  dividas: {
    total_cents: 0,
    paid_cents: 0,
    remaining_cents: 0,
    open_count: 0,
    settled_count: 0,
    percent: 0,
  },
};

beforeEach(() => {
  vi.mocked(dashboardApi.overview).mockReset().mockResolvedValue(painel);
});

describe("DashboardPage", () => {
  it("abre com o saldo atual acumulado e o custo de vida", async () => {
    render(<DashboardPage />);

    const saldo = await screen.findByText("Saldo atual");
    expect(saldo).toBeInTheDocument();
    expect(screen.getByText(/7\.500,00/)).toBeInTheDocument();

    expect(screen.getByText("Despesas fixas")).toBeInTheDocument();
    expect(screen.getByText("Seu custo de vida atual")).toBeInTheDocument();
    expect(screen.getByText(/2\.159,90/)).toBeInTheDocument();
  });

  it("o saldo atual mostra só o valor, sem legenda embaixo", async () => {
    render(<DashboardPage />);
    await screen.findByText("Saldo atual");

    expect(
      screen.queryByText(/Tudo que já foi pago e recebido/),
    ).not.toBeInTheDocument();
  });

  it("um campo que a API não devolveu vira aviso, não R$ NaN", async () => {
    // Acontece quando o backend em execução é anterior ao campo novo.
    const semOsCamposNovos = { ...painel } as Partial<Dashboard>;
    delete semOsCamposNovos.saldo_atual_cents;
    delete semOsCamposNovos.despesas_fixas_cents;

    vi.mocked(dashboardApi.overview).mockResolvedValue(semOsCamposNovos as Dashboard);

    render(<DashboardPage />);
    await screen.findByText("Saldo atual");

    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Indisponível").length).toBeGreaterThan(0);
  });

  it("não mostra mais os números do mês que confundiam com o saldo atual", async () => {
    render(<DashboardPage />);
    await screen.findByText("Saldo atual");

    expect(screen.queryByText("Saldo atual do mês")).not.toBeInTheDocument();
    expect(screen.queryByText("Saldo previsto do mês")).not.toBeInTheDocument();
    expect(screen.queryByText("Despesas do mês")).not.toBeInTheDocument();
    // "Saldo de 2026" era lido como saldo atual; sumiu junto.
    expect(screen.queryByText(/^Saldo de /)).not.toBeInTheDocument();
  });

  it("não mostra os totais do ano em cartão: eles já estão no gráfico", async () => {
    render(<DashboardPage />);
    await screen.findByText("Saldo atual");

    expect(screen.queryByText("Receitas em 2026")).not.toBeInTheDocument();
    expect(screen.queryByText("Despesas em 2026")).not.toBeInTheDocument();
  });

  it("o cabeçalho traz só o título", async () => {
    render(<DashboardPage />);
    await screen.findByText("Saldo atual");

    expect(screen.queryByText(/e o ano inteiro em volta/)).not.toBeInTheDocument();
  });

  it("esconde o bloco de dívidas quando não há nenhuma em aberto", async () => {
    render(<DashboardPage />);
    await screen.findByText("Saldo atual");

    expect(screen.queryByText("Falta pagar em dívidas")).not.toBeInTheDocument();
  });

  it("mostra o que falta pagar quando há dívida em aberto", async () => {
    vi.mocked(dashboardApi.overview).mockResolvedValue({
      ...painel,
      dividas: {
        total_cents: 1843086,
        paid_cents: 877660,
        remaining_cents: 965426,
        open_count: 1,
        settled_count: 0,
        percent: 47,
      },
    });

    render(<DashboardPage />);

    expect(await screen.findByText("Falta pagar em dívidas")).toBeInTheDocument();
    expect(screen.getByText(/9\.654,26/)).toBeInTheDocument();
    expect(screen.getByText("1 dívida em aberto")).toBeInTheDocument();
    expect(screen.getByText("47% do total das dívidas")).toBeInTheDocument();
  });

  it("mostra o erro quando o painel não carrega", async () => {
    vi.mocked(dashboardApi.overview).mockRejectedValue(new Error("falhou"));

    render(<DashboardPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar o painel");
  });
});
