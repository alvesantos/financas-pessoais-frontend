import { useEffect, useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";
import { monthName } from "../../../lib/dates";
import { formatMoney } from "../../../lib/money";
import { ApiError } from "../../../lib/api-error";
import { dashboardApi } from "../api/dashboard.api";
import { ExpenseByKindChart } from "../components/ExpenseByKindChart";
import { StatTile } from "../components/StatTile";
import { YearChart } from "../components/YearChart";
import type { Dashboard } from "../types";
import "./DashboardPage.css";

const hoje = new Date();
const anoAtual = hoje.getFullYear();
const mesAtual = hoje.getMonth() + 1;

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    dashboardApi
      .overview(anoAtual, mesAtual, controller.signal)
      .then(setData)
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof ApiError ? caught.message : "Não foi possível carregar o painel.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <p className="loading-note">Carregando…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <Alert>{error || "Não foi possível carregar o painel."}</Alert>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Painel</h1>
        <p>
          {monthName(mesAtual)} de {anoAtual}, e o ano inteiro em volta.
        </p>
      </header>

      <section className="stat-grid" aria-label={`Resumo de ${anoAtual}`}>
        <StatTile label={`Saldo de ${anoAtual}`} cents={data.year.saldo_cents} signed hint="Receitas menos tudo que sai" />
        <StatTile label="Receitas no ano" cents={data.year.receitas_cents} />
        <StatTile label="Despesas no ano" cents={data.year.despesas_cents} />
      </section>

      <section className="stat-grid" aria-label={`Resumo de ${monthName(mesAtual)}`}>
        <StatTile
          label="Saldo atual do mês"
          cents={data.month.saldo_atual_cents}
          signed
          hint="Até hoje"
        />
        <StatTile
          label="Saldo previsto do mês"
          cents={data.month.saldo_previsto_cents}
          signed
          hint="Com os fixos que ainda vão cair"
        />
        <StatTile label="Despesas do mês" cents={data.month.despesas_cents} />
      </section>

      <Card title={`Receitas e despesas em ${anoAtual}`}>
        <YearChart data={data.por_mes} year={anoAtual} />
      </Card>

      <Card title={`Onde o dinheiro foi em ${monthName(mesAtual).toLowerCase()}`}>
        <ExpenseByKindChart data={data.gastos_por_tipo} />

        {data.maior_gasto && (
          <p className="dashboard-note">
            Maior gasto do mês: <strong>{data.maior_gasto.description}</strong>,{" "}
            {formatMoney(data.maior_gasto.amount_cents)}.
          </p>
        )}
      </Card>
    </div>
  );
}
