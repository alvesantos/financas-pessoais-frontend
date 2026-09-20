import { EmptyState } from "../../../components/ui/EmptyState";
import { IconButton } from "../../../components/ui/IconButton";
import { dayOfISO } from "../../../lib/dates";
import { formatSignedMoney } from "../../../lib/money";
import { isIncome } from "../../../types/finance";
import type { Transaction } from "../types";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onMarkPaid: (transaction: Transaction) => void;
}

/**
 * Lista do mês. Cada linha traz o dia, a descrição e, embaixo dela, a
 * categoria, o tipo e a origem: a frequência quando veio de um fixo, o
 * número da parcela quando veio de uma dívida.
 */
/** Projeções não têm id próprio, então a chave vem da origem e da data. */
function keyOf(transaction: Transaction): string {
  if (transaction.debt_id) {
    return `divida-${transaction.debt_id}-${transaction.installment_number}`;
  }
  if (transaction.recurring_id) {
    return `fixo-${transaction.recurring_id}-${transaction.occurred_at}`;
  }
  return `lancamento-${transaction.id}`;
}

export function TransactionList({
  transactions,
  onDelete,
  onEdit,
  onMarkPaid,
}: TransactionListProps) {
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
          key={keyOf(transaction)}
          className="entry"
        >
          <span className="entry-day" aria-label={`Dia ${dayOfISO(transaction.occurred_at)}`}>
            {String(dayOfISO(transaction.occurred_at)).padStart(2, "0")}
          </span>

          <span className="entry-body">
            <span className="entry-description">{transaction.description}</span>
            <span className="entry-meta">
              {transaction.category_name && (
                <>
                  <span
                    className="category-dot"
                    style={{ background: transaction.category_color ?? undefined }}
                    aria-hidden="true"
                  />
                  {transaction.category_name}
                  {" · "}
                </>
              )}
              {transaction.kind_label}
              {transaction.frequency_label && (
                <>
                  {" · "}
                  <span className="entry-tag">Fixo {transaction.frequency_label.toLowerCase()}</span>
                </>
              )}
              {!transaction.paid && (
                <>
                  {" · "}
                  <span className="entry-pending">
                    {isIncome(transaction.kind) ? "A receber" : "A pagar"}
                  </span>
                </>
              )}
              {transaction.installment_number && (
                <>
                  {" · "}
                  <span className="entry-tag">
                    Parcela {transaction.installment_number}/{transaction.installments_total}
                  </span>
                </>
              )}
            </span>
          </span>

          <span className={`entry-amount${isIncome(transaction.kind) ? " is-positive" : " is-negative"}`}>
            {formatSignedMoney(transaction.signed_cents)}
          </span>

          {transaction.projected ? (
            // Projeções não existem como linha: só somem tirando a origem.
            <span
              className="entry-action-placeholder"
              title={transaction.debt_id ? "Parcela de uma dívida" : "Gerado por um lançamento fixo"}
            />
          ) : (
            <span className="entry-actions">
              {!transaction.paid && (
                <IconButton
                  icon="confirmar"
                  label={
                    isIncome(transaction.kind)
                      ? `Marcar ${transaction.description} como recebido`
                      : `Marcar ${transaction.description} como pago`
                  }
                  confirm
                  onClick={() => onMarkPaid(transaction)}
                />
              )}
              <IconButton
                icon="editar"
                label={`Editar ${transaction.description}`}
                onClick={() => onEdit(transaction)}
              />
              <IconButton
                icon="excluir"
                label={`Apagar ${transaction.description}`}
                danger
                onClick={() => onDelete(transaction)}
              />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
