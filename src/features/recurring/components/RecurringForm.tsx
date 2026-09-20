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
import { recurringApi } from "../api/recurring.api";
import type { RecurringEntry } from "../types";

const kindOptions = allKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }));
const frequencyOptions = allFrequencies.map((frequency) => ({
  value: frequency,
  label: frequencyLabels[frequency],
}));

interface RecurringFormProps {
  /** Quando presente, o formulário edita em vez de criar. */
  editing?: RecurringEntry | null;
  onCreated: () => void;
  onCancelEdit?: () => void;
}

/** Cadastra um gasto ou receita fixo, como "Academia, todo dia 20". */
export function RecurringForm({ editing = null, onCreated, onCancelEdit }: RecurringFormProps) {
  const [amount, setAmount] = useState(() =>
    editing ? (editing.amount_cents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [kind, setKind] = useState<Kind>(editing?.kind ?? "despesa");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [frequency, setFrequency] = useState<Frequency>(editing?.frequency ?? "mensal");
  const [startDate, setStartDate] = useState(editing?.start_date ?? todayISO());
  const [categoryId, setCategoryId] = useState<number | null>(editing?.category_id ?? null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const payload = {
        description,
        amount_cents: amountCents,
        kind,
        frequency,
        start_date: startDate,
        category_id: categoryId,
      };

      if (editing) {
        await recurringApi.update(editing.id, payload);
      } else {
        await recurringApi.create(payload);
        setAmount("");
        setDescription("");
      }

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
        <MoneyField label="Valor" value={amount} onChange={setAmount} error={fieldErrors.amount_cents} />
        <Select label="Tipo" value={kind} options={kindOptions} onChange={setKind} error={fieldErrors.kind} />
      </div>

      <div className="entry-form-row">
        <TextField
          label="Descrição (opcional)"
          name="description"
          placeholder="Academia, aluguel, salário…"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={fieldErrors.description}
        />

        <Select
          label="Frequência"
          value={frequency}
          options={frequencyOptions}
          onChange={setFrequency}
          error={fieldErrors.frequency}
        />
      </div>

      <div className="entry-form-row">
        <CategorySelect
          kind={kind}
          value={categoryId}
          onChange={setCategoryId}
          error={fieldErrors.category_id}
        />

        <TextField
          label="Começa em"
          name="start_date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          error={fieldErrors.start_date}
        />
      </div>

      {formError && <Alert>{formError}</Alert>}

      <div className="entry-form-actions">
        <Button type="submit" loading={submitting}>
          {editing ? "Salvar alterações" : "Adicionar fixo"}
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
