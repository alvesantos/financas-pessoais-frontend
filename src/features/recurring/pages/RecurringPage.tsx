import { useCallback, useEffect, useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { formatDayMonth } from "../../../lib/dates";
import { formatMoney } from "../../../lib/money";
import { isIncome } from "../../../types/finance";
import { recurringApi } from "../api/recurring.api";
import { RecurringForm } from "../components/RecurringForm";
import type { RecurringEntry } from "../types";
import "./RecurringPage.css";

export function RecurringPage() {
  // A versão carregada é comparada com a pedida para derivar o carregamento,
  // em vez de um setState no começo do efeito.
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<{ version: number; entries: RecurringEntry[] }>({
    version: -1,
    entries: [],
  });
  const [error, setError] = useState("");

  const loading = loaded.version !== version;
  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    recurringApi
      .list(controller.signal)
      .then((entries) => setLoaded({ version, entries }))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;

        setError("Não foi possível carregar os fixos.");
        setLoaded({ version, entries: [] });
      });

    return () => controller.abort();
  }, [version]);

  async function handleDelete(entry: RecurringEntry) {
    setError("");

    try {
      await recurringApi.remove(entry.id);
      reload();
    } catch {
      setError("Não foi possível apagar o fixo.");
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Fixos</h1>
        <p>
          Gastos e receitas que se repetem. Eles aparecem sozinhos na tela de lançamentos, no dia
          certo de cada mês.
        </p>
      </header>

      <Card title="Novo fixo">
        <RecurringForm onCreated={reload} />
      </Card>

      <Card title="Seus fixos">
        {error && <Alert>{error}</Alert>}

        {loading ? (
          <p className="loading-note">Carregando…</p>
        ) : loaded.entries.length === 0 ? (
          <EmptyState
            title="Nenhum fixo cadastrado"
            hint="Cadastre o que se repete todo mês: academia, aluguel, salário."
          />
        ) : (
          <ul className="entries">
            {loaded.entries.map((entry) => (
              <li key={entry.id} className="entry">
                <span className="entry-body">
                  <span className="entry-description">{entry.description}</span>
                  <span className="entry-meta">
                    {entry.kind_label} · <span className="entry-tag">{entry.frequency_label}</span> ·
                    desde {formatDayMonth(entry.start_date)}
                  </span>
                </span>

                <span className={`entry-amount${isIncome(entry.kind) ? " is-positive" : " is-negative"}`}>
                  {formatMoney(entry.amount_cents)}
                </span>

                <button
                  type="button"
                  className="entry-action"
                  onClick={() => handleDelete(entry)}
                  aria-label={`Apagar ${entry.description}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
