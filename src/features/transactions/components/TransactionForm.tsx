import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { MoneyField } from "../../../components/ui/MoneyField";
import { Select } from "../../../components/ui/Select";
import { TextField } from "../../../components/ui/TextField";
import { todayISO } from "../../../lib/dates";
import { ApiError, type FieldErrors } from "../../../lib/api-error";
import { parseMoneyToCents } from "../../../lib/money";
import { allFrequencies, allKinds, frequencyLabels, isIncome, kindLabels } from "../../../types/finance";
import type { Frequency, Kind } from "../../../types/finance";
import { CardPicker } from "../../cards/components/CardPicker";
import type { InvoiceChoice } from "../../cards/types";
import { CategorySelect } from "../../categories/components/CategorySelect";
import { recurringApi } from "../../recurring/api/recurring.api";
import { transactionsApi } from "../api/transactions.api";
import type { Transaction } from "../types";

const kindOptions = allKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }));
const frequencyOptions = allFrequencies.map((frequency) => ({
  value: frequency,
  label: frequencyLabels[frequency],
}));

interface TransactionFormProps {
  /** Data que o campo assume ao abrir, normalmente o dia de hoje. */
  defaultDate?: string;
  /** Quando presente, o formulário edita em vez de criar. */
  editing?: Transaction | null;
  onCreated: () => void;
  onCancelEdit?: () => void;
}

/**
 * Cria um lançamento. Marcando "é um lançamento fixo", o que é gravado é a
 * regra de recorrência, e ela passa a projetar o lançamento em todos os
 * meses, em vez de existir só neste.
 */
export function TransactionForm({
  defaultDate,
  editing = null,
  onCreated,
  onCancelEdit,
}: TransactionFormProps) {
  // O formulário é remontado por key ao entrar e sair da edição, então o
  // estado inicial basta: não há efeito sincronizando props com estado.
  const [amount, setAmount] = useState(() =>
    editing ? (editing.amount_cents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [kind, setKind] = useState<Kind>(editing?.kind ?? "despesa");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [date, setDate] = useState(editing?.occurred_at ?? defaultDate ?? todayISO());
  const [categoryId, setCategoryId] = useState<number | null>(editing?.category_id ?? null);
  const [paid, setPaid] = useState(editing ? editing.paid : true);
  const [cardId, setCardId] = useState<number | null>(editing?.credit_card_id ?? null);
  const [invoice, setInvoice] = useState<InvoiceChoice>("atual");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("mensal");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setAmount("");
    setDescription("");
    setIsRecurring(false);
  }

  const isCard = kind === "cartao_credito";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");

    const amountCents = parseMoneyToCents(amount);
    if (amountCents === null || amountCents <= 0) {
      setFieldErrors({ amount_cents: "informe um valor maior que zero" });
      return;
    }

    setSubmitting(true);
    try {
      if (isRecurring) {
        await recurringApi.create({
          description,
          amount_cents: amountCents,
          kind,
          frequency,
          start_date: date,
          category_id: categoryId,
        });
      } else {
        const payload = {
          description,
          amount_cents: amountCents,
          kind,
          occurred_at: date,
          category_id: categoryId,
          paid,
          credit_card_id: isCard ? cardId : null,
          invoice: isCard && cardId !== null ? invoice : undefined,
        };

        if (editing) {
          await transactionsApi.update(editing.id, payload);
        } else {
          await transactionsApi.create(payload);
        }
      }

      reset();
      onCreated();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fields);
        if (!error.hasFieldErrors) setFormError(error.message);
      } else {
        setFormError("Algo deu errado. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit} noValidate>
      <div className="entry-form-row">
        <MoneyField
          label="Valor"
          value={amount}
          onChange={setAmount}
          error={fieldErrors.amount_cents}
        />

        <Select label="Tipo" value={kind} options={kindOptions} onChange={setKind} error={fieldErrors.kind} />
      </div>

      <div className="entry-form-row">
        <CategorySelect
          kind={kind}
          value={categoryId}
          onChange={setCategoryId}
          error={fieldErrors.category_id}
        />

        <TextField
          label="Descrição (opcional)"
          name="description"
          placeholder="Sem descrição, usamos o tipo"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={fieldErrors.description}
        />

      </div>

      <div className="entry-form-row">
        <TextField
          label={isRecurring ? "Começa em" : "Data"}
          name="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          error={fieldErrors.occurred_at ?? fieldErrors.start_date}
        />
      </div>

      {isCard && (
        <div className="entry-form-row">
          <CardPicker
            cardId={cardId}
            invoice={invoice}
            cardError={fieldErrors.credit_card_id}
            onCardChange={setCardId}
            onInvoiceChange={setInvoice}
          />
        </div>
      )}

      <div className="entry-form-checks">
        {/* Um lançamento já gravado não vira regra de recorrência. */}
        {!editing && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(event) => setIsRecurring(event.target.checked)}
            />
            <span>É um lançamento fixo</span>
          </label>
        )}

        {!isRecurring && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={paid}
              onChange={(event) => setPaid(event.target.checked)}
            />
            <span>{isIncome(kind) ? "Já recebi" : "Já paguei"}</span>
          </label>
        )}
      </div>

      {isRecurring && (
        <div className="entry-form-row">
          <Select
            label="Com que frequência"
            value={frequency}
            options={frequencyOptions}
            onChange={setFrequency}
            error={fieldErrors.frequency}
          />
          <p className="entry-form-hint">
            O lançamento passa a aparecer sozinho em todos os meses, a partir da data escolhida.
          </p>
        </div>
      )}

      {formError && <Alert>{formError}</Alert>}

      <div className="entry-form-actions">
        <Button type="submit" loading={submitting}>
          {editing ? "Salvar alterações" : isRecurring ? "Criar lançamento fixo" : "Adicionar lançamento"}
        </Button>

        {editing && onCancelEdit && (
          <Button type="button" variant="ghost" onClick={onCancelEdit}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
