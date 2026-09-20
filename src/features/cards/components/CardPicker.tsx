import { useEffect } from "react";
import { Select } from "../../../components/ui/Select";
import { useCards } from "../hooks/useCards";
import type { InvoiceChoice } from "../types";

const SEM_CARTAO = "";

const invoiceOptions: { value: InvoiceChoice; label: string }[] = [
  { value: "atual", label: "Fatura atual" },
  { value: "proxima", label: "Próxima fatura" },
];

interface CardPickerProps {
  cardId: number | null;
  invoice: InvoiceChoice;
  cardError?: string;
  onCardChange: (cardId: number | null) => void;
  onInvoiceChange: (invoice: InvoiceChoice) => void;
}

/**
 * Escolha do cartão e da fatura, mostrada só quando o lançamento é de cartão
 * de crédito. Com um cartão só, ele já vem marcado: não faz sentido pedir
 * uma escolha que só tem uma resposta.
 */
export function CardPicker({
  cardId,
  invoice,
  cardError,
  onCardChange,
  onInvoiceChange,
}: CardPickerProps) {
  const { cards, loading } = useCards();

  useEffect(() => {
    if (loading || cardId !== null) return;

    if (cards.length === 1) {
      onCardChange(cards[0]!.id);
    }
  }, [cards, cardId, loading, onCardChange]);

  if (!loading && cards.length === 0) {
    return (
      <p className="entry-form-hint">
        Nenhum cartão cadastrado ainda. Você pode lançar assim mesmo e ligar o cartão depois.
      </p>
    );
  }

  const cardOptions = [
    { value: SEM_CARTAO, label: "Sem cartão" },
    ...cards.map((card) => ({ value: String(card.id), label: card.name })),
  ];

  return (
    <>
      <Select
        label="Cartão"
        value={cardId === null ? SEM_CARTAO : String(cardId)}
        options={cardOptions}
        onChange={(selected) => onCardChange(selected === SEM_CARTAO ? null : Number(selected))}
        error={cardError}
      />

      <Select
        label="Entra em"
        value={invoice}
        options={invoiceOptions}
        onChange={onInvoiceChange}
        disabled={cardId === null}
      />
    </>
  );
}
