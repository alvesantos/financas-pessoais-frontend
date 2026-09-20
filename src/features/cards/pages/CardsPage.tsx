import { useCallback, useEffect, useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { IconButton } from "../../../components/ui/IconButton";
import { formatMoney } from "../../../lib/money";
import { cardsApi } from "../api/cards.api";
import { CardForm } from "../components/CardForm";
import type { CreditCard } from "../types";

export function CardsPage() {
  // A versão carregada é comparada com a pedida para derivar o carregamento,
  // em vez de um setState no começo do efeito.
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<{ version: number; cards: CreditCard[] }>({
    version: -1,
    cards: [],
  });
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CreditCard | null>(null);

  const loading = loaded.version !== version;
  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    cardsApi
      .list(controller.signal)
      .then((cards) => setLoaded({ version, cards }))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;

        setError("Não foi possível carregar os cartões.");
        setLoaded({ version, cards: [] });
      });

    return () => controller.abort();
  }, [version]);

  async function handleDelete(card: CreditCard) {
    setError("");

    try {
      await cardsApi.remove(card.id);
      if (editing?.id === card.id) setEditing(null);
      reload();
    } catch {
      setError("Não foi possível apagar o cartão.");
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Cartões</h1>
        <p>
          Seus cartões de crédito. Ao lançar um gasto no cartão, você escolhe qual deles e se a
          compra entra na fatura atual ou na próxima.
        </p>
      </header>

      <Card title={editing ? "Editar cartão" : "Novo cartão"}>
        <CardForm
          key={editing?.id ?? "novo"}
          editing={editing}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
          onCancelEdit={() => setEditing(null)}
        />
      </Card>

      <Card title="Seus cartões">
        {error && <Alert>{error}</Alert>}

        {loading ? (
          <p className="loading-note">Carregando…</p>
        ) : loaded.cards.length === 0 ? (
          <EmptyState
            title="Nenhum cartão cadastrado"
            hint="Cadastre o cartão para escolher a fatura de cada compra."
          />
        ) : (
          <ul className="entries">
            {loaded.cards.map((card) => (
              <li key={card.id} className="entry">
                <span className="entry-body">
                  <span className="entry-description">{card.name}</span>
                  <span className="entry-meta">
                    Melhor dia {card.best_purchase_day} · vence dia {card.due_day}
                  </span>
                </span>

                <span className="entry-amount">{formatMoney(card.limit_cents)}</span>

                <span className="entry-actions">
                  <IconButton
                    icon="editar"
                    label={`Editar ${card.name}`}
                    onClick={() => setEditing(card)}
                  />
                  <IconButton
                    icon="excluir"
                    label={`Apagar ${card.name}`}
                    danger
                    onClick={() => handleDelete(card)}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
