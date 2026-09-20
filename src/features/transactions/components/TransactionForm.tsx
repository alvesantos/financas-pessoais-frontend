import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { MoneyField } from "../../../components/ui/MoneyField";
import { Select } from "../../../components/ui/Select";
import { TextField } from "../../../components/ui/TextField";
import { todayISO } from "../../../lib/dates";
import { ApiError, type FieldErrors } from "../../../lib/api-error";
import { parseMoneyToCents } from "../../../lib/money";
import { allFrequencies, allKinds, frequencyLabels, kindLabels } from "../../../types/finance";
import type { Frequency, Kind } from "../../../types/finance";
import { CategorySelect } from "../../categories/components/CategorySelect";
import { recurringApi } from "../../recurring/api/recurring.api";
import { transactionsApi } from "../api/transactions.api";

const kindOptions = allKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }));
const frequencyOptions = allFrequencies.map((frequency) => ({
  value: frequency,
  label: frequencyLabels[frequency],
}));

interface TransactionFormProps {
  /** Data que o campo assume ao abrir, normalmente o dia de hoje. */
  defaultDate?: string;
  onCreated: () => void;
}

/**
 * Cria um lançamento. Marcando "é um lançamento fixo", o que é gravado é a
 * regra de recorrência, e ela passa a projetar o lançamento em todos os
 * meses, em vez de existir só neste.
 */
export function TransactionForm({ defaultDate, onCreated }: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<Kind>("despesa");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(defaultDate ?? todayISO());
  const [categoryId, setCategoryId] = useState<number | null>(null);
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
        await transactionsApi.create({
          description,
          amount_cents: amountCents,
          kind,
          occurred_at: date,
          category_id: categoryId,
        });
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

      <label className="checkbox">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(event) => setIsRecurring(event.target.checked)}
        />
        <span>É um lançamento fixo</span>
      </label>

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

      <Button type="submit" loading={submitting}>
        {isRecurring ? "Criar lançamento fixo" : "Adicionar lançamento"}
      </Button>
    </form>
  );
}
