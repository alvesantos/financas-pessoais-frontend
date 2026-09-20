import { EmptyState } from "../../../components/ui/EmptyState";
import { dayOfISO } from "../../../lib/dates";
import { formatSignedMoney } from "../../../lib/money";
import { isIncome } from "../../../types/finance";
import type { Transaction } from "../types";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (transaction: Transaction) => void;
}

/**
 * Lista do mês. Cada linha traz o dia, a descrição e, embaixo dela, o tipo —
 * e a frequência, quando a linha veio de um lançamento fixo.
 */
export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Nenhum lançamento neste mês"
        hint="Adicione o primeiro no formulário acima."
      />
    );
  }

  return (
    <ul className="entries">
      {transactions.map((transaction) => (
        <li
          key={transaction.projected ? `fixo-${transaction.recurring_id}-${transaction.occurred_at}` : transaction.id}
          className="entry"
        >
          <span className="entry-day" aria-label={`Dia ${dayOfISO(transaction.occurred_at)}`}>
            {String(dayOfISO(transaction.occurred_at)).padStart(2, "0")}
          </span>

          <span className="entry-body">
            <span className="entry-description">{transaction.description}</span>
            <span className="entry-meta">
              {transaction.kind_label}
              {transaction.frequency_label && (
                <>
                  {" · "}
                  <span className="entry-tag">Fixo {transaction.frequency_label.toLowerCase()}</span>
                </>
              )}
            </span>
          </span>

          <span className={`entry-amount${isIncome(transaction.kind) ? " is-positive" : " is-negative"}`}>
            {formatSignedMoney(transaction.signed_cents)}
          </span>

          {transaction.projected ? (
            // Projeções não existem como linha: só some tirando o fixo.
            <span className="entry-action-placeholder" title="Gerado por um lançamento fixo" />
          ) : (
            <button
              type="button"
              className="entry-action"
              onClick={() => onDelete(transaction)}
              aria-label={`Apagar ${transaction.description}`}
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
