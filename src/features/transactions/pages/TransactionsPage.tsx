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

  function goTo([nextYear, nextMonthNumber]: [number, number]) {
    setYear(nextYear);
    setMonth(nextMonthNumber);
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

      <Card title="Novo lançamento">
        <TransactionForm onCreated={reload} />
      </Card>

      <Card title="Lançamentos do mês">
        {error && <Alert>{error}</Alert>}
        {deleteError && <Alert>{deleteError}</Alert>}

        {loading ? (
          <p className="loading-note">Carregando…</p>
        ) : (
          <TransactionList transactions={transactions} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  );
}
