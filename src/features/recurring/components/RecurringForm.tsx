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
import { recurringApi } from "../api/recurring.api";

const kindOptions = allKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }));
const frequencyOptions = allFrequencies.map((frequency) => ({
  value: frequency,
  label: frequencyLabels[frequency],
}));

/** Cadastra um gasto ou receita fixo, como "Academia, todo dia 20". */
export function RecurringForm({ onCreated }: { onCreated: () => void }) {
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<Kind>("despesa");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("mensal");
  const [startDate, setStartDate] = useState(todayISO());

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
      await recurringApi.create({
        description,
        amount_cents: amountCents,
        kind,
        frequency,
        start_date: startDate,
      });

      setAmount("");
      setDescription("");
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
        <TextField
          label="Começa em"
          name="start_date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          error={fieldErrors.start_date}
        />
        <p className="entry-form-hint">
          O dia escolhido vira o dia da repetição: começando em 20/01 e mensal, cai todo dia 20.
        </p>
      </div>

      {formError && <Alert>{formError}</Alert>}

      <Button type="submit" loading={submitting}>
        Adicionar fixo
      </Button>
    </form>
  );
}
