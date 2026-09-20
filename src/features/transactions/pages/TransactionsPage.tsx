import { useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";
import { nextMonth, previousMonth } from "../../../lib/dates";
import { BalanceCards } from "../components/BalanceCards";
import { MonthNavigator } from "../components/MonthNavigator";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionList } from "../components/TransactionList";
import { useMonthData } from "../hooks/useMonthData";
import { transactionsApi } from "../api/transactions.api";
import type { Transaction } from "../types";
import "./TransactionsPage.css";

const hoje = new Date();

export function TransactionsPage() {
  const [year, setYear] = useState(hoje.getFullYear());
  const [month, setMonth] = useState(hoje.getMonth() + 1);

  const { transactions, summary, loading, error, reload } = useMonthData(year, month);
  const [deleteError, setDeleteError] = useState("");
  const [editing, setEditing] = useState<Transaction | null>(null);

  function goTo([nextYear, nextMonthNumber]: [number, number]) {
    setYear(nextYear);
    setMonth(nextMonthNumber);
  }

  /**
   * Marca como pago sem abrir o formulário.
   *
   * Projeção não tem linha no banco: marcar uma grava a ocorrência, e aí a
   * projeção daquela data para de aparecer. Lançamento já gravado só troca
   * a marcação, e como a API tem o PUT inteiro, os outros campos voltam
   * como estão.
   */
  async function handleMarkPaid(transaction: Transaction) {
    setDeleteError("");

    try {
      if (transaction.projected) {
        const origem = transaction.debt_id
          ? { origin: "divida" as const, origin_id: transaction.debt_id }
          : { origin: "fixo" as const, origin_id: transaction.recurring_id! };

        await transactionsApi.payOccurrence({
          ...origem,
          occurred_at: transaction.occurred_at,
        });
        reload();
        return;
      }

      await transactionsApi.update(transaction.id, {
        description: transaction.description,
        amount_cents: transaction.amount_cents,
        kind: transaction.kind,
        occurred_at: transaction.occurred_at,
        category_id: transaction.category_id,
        paid: true,
        credit_card_id: transaction.credit_card_id,
      });
      reload();
    } catch {
      setDeleteError("Não foi possível marcar como pago.");
    }
  }

  async function handleDelete(transaction: Transaction) {
    setDeleteError("");

    try {
      await transactionsApi.remove(transaction.id);
      reload();
    } catch {
      setDeleteError("Não foi possível apagar o lançamento.");
    }
  }

  return (
    <div className="page">
      <MonthNavigator
        year={year}
        month={month}
        onPrevious={() => goTo(previousMonth(year, month))}
        onNext={() => goTo(nextMonth(year, month))}
      />

      <BalanceCards summary={summary} />

      <Card title={editing ? "Editar lançamento" : "Novo lançamento"}>
        <TransactionForm
          // A key remonta o formulário ao entrar e sair da edição, o que
          // dispensa sincronizar props com estado.
          key={editing?.id ?? "novo"}
          editing={editing}
          onCreated={() => {
            setEditing(null);
            reload();
          }}
          onCancelEdit={() => setEditing(null)}
        />
      </Card>

      <Card title="Lançamentos do mês">
        {error && <Alert>{error}</Alert>}
        {deleteError && <Alert>{deleteError}</Alert>}

        {loading ? (
          <p className="loading-note">Carregando…</p>
        ) : (
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
            onEdit={setEditing}
            onMarkPaid={handleMarkPaid}
          />
        )}
      </Card>
    </div>
  );
}
