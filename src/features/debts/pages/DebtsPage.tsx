import { useCallback, useEffect, useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { formatDayMonth } from "../../../lib/dates";
import { formatMoney } from "../../../lib/money";
import { debtsApi } from "../api/debts.api";
import { DebtForm } from "../components/DebtForm";
import { DebtMeter } from "../components/DebtMeter";
import type { Debt } from "../types";
import "./DebtsPage.css";

export function DebtsPage() {
  // A versão carregada é comparada com a pedida para derivar o carregamento,
  // em vez de um setState no começo do efeito.
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<{ version: number; debts: Debt[] }>({
    version: -1,
    debts: [],
  });
  const [error, setError] = useState("");

  const loading = loaded.version !== version;
  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    debtsApi
      .list(controller.signal)
      .then((debts) => setLoaded({ version, debts }))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;

        setError("Não foi possível carregar as dívidas.");
        setLoaded({ version, debts: [] });
      });

    return () => controller.abort();
  }, [version]);

  async function handleDelete(debt: Debt) {
    setError("");

    try {
      await debtsApi.remove(debt.id);
      reload();
    } catch {
      setError("Não foi possível apagar a dívida.");
    }
  }

  const emAberto = loaded.debts.filter((debt) => !debt.progress.settled);
  const totalRestante = emAberto.reduce((sum, debt) => sum + debt.progress.remaining_cents, 0);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dívidas</h1>
        <p>
          Empréstimos, acordos e parcelamentos. As parcelas aparecem sozinhas nos lançamentos, e
          aqui você vê o quanto falta para quitar.
        </p>
      </header>

      {emAberto.length > 0 && (
        <section className="stat-grid is-primary" aria-label="Situação das dívidas">
          <div className="stat-tile">
            <p className="stat-label">Falta pagar</p>
            <p className="stat-value is-negative">{formatMoney(totalRestante)}</p>
            <p className="stat-hint">
              {emAberto.length === 1 ? "1 dívida em aberto" : `${emAberto.length} dívidas em aberto`}
            </p>
          </div>
        </section>
      )}

      <Card title="Nova dívida">
        <DebtForm onCreated={reload} />
      </Card>

      <Card title="Suas dívidas">
        {error && <Alert>{error}</Alert>}

        {loading ? (
          <p className="loading-note">Carregando…</p>
        ) : loaded.debts.length === 0 ? (
          <EmptyState
            title="Nenhuma dívida registrada"
            hint="Registre o empréstimo ou o parcelamento para acompanhar a quitação."
          />
        ) : (
          <ul className="debts">
            {loaded.debts.map((debt) => (
              <li key={debt.id} className={`debt${debt.progress.settled ? " is-settled" : ""}`}>
                <div className="debt-head">
                  <div className="debt-title">
                    <strong>{debt.description}</strong>
                    <span className="entry-meta">
                      {debt.category_name && (
                        <>
                          <span
                            className="category-dot"
                            style={{ background: debt.category_color ?? undefined }}
                            aria-hidden="true"
                          />
                          {debt.category_name}
                          {" · "}
                        </>
                      )}
                      {debt.installments}x de {formatMoney(debt.installment_amount_cents)}
                      {" · "}
                      {debt.frequency_label.toLowerCase()}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="entry-action"
                    onClick={() => handleDelete(debt)}
                    aria-label={`Apagar ${debt.description}`}
                  >
                    ×
                  </button>
                </div>

                <DebtMeter progress={debt.progress} />

                <p className="debt-dates">
                  {debt.progress.next_due_date
                    ? `Próxima em ${formatDayMonth(debt.progress.next_due_date)}`
                    : "Sem parcelas a vencer"}
                  {" · "}
                  {debt.progress.settled ? "Quitada em " : "Quita em "}
                  {formatDayMonth(debt.progress.final_due_date)}/
                  {debt.progress.final_due_date.slice(0, 4)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
