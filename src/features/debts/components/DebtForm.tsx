import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { MoneyField } from "../../../components/ui/MoneyField";
import { Select } from "../../../components/ui/Select";
import { TextField } from "../../../components/ui/TextField";
import { todayISO } from "../../../lib/dates";
import { ApiError, type FieldErrors } from "../../../lib/api-error";
import { formatMoney, parseMoneyToCents } from "../../../lib/money";
import { allFrequencies, frequencyLabels, kindLabels } from "../../../types/finance";
import type { Frequency, Kind } from "../../../types/finance";
import { CategorySelect } from "../../categories/components/CategorySelect";
import { debtsApi } from "../api/debts.api";

/** Dívida é saída: receita e investimento não cabem aqui. */
const kindOptions: { value: Kind; label: string }[] = [
  { value: "despesa", label: kindLabels.despesa },
  { value: "cartao_credito", label: kindLabels.cartao_credito },
];

const frequencyOptions = allFrequencies.map((frequency) => ({
  value: frequency,
  label: frequencyLabels[frequency],
}));

export function DebtForm({ onCreated }: { onCreated: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("12");
  const [kind, setKind] = useState<Kind>("despesa");
  const [frequency, setFrequency] = useState<Frequency>("mensal");
  const [firstDueDate, setFirstDueDate] = useState(todayISO());
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prévia do total, para a pessoa conferir antes de registrar.
  const installmentCents = parseMoneyToCents(amount);
  const count = Number(installments);
  const totalCents =
    installmentCents !== null && Number.isInteger(count) && count > 0
      ? installmentCents * count
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");

    if (installmentCents === null || installmentCents <= 0) {
      setFieldErrors({ installment_amount_cents: "informe o valor da parcela" });
      return;
    }
    if (!Number.isInteger(count) || count <= 0) {
      setFieldErrors({ installments: "informe quantas parcelas são" });
      return;
    }

    setSubmitting(true);
    try {
      await debtsApi.create({
        description,
        installment_amount_cents: installmentCents,
        installments: count,
        kind,
        frequency,
        first_due_date: firstDueDate,
        category_id: categoryId,
      });

      setDescription("");
      setAmount("");
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
        <TextField
          label="O que é"
          name="description"
          placeholder="Empréstimo, acordo, parcelamento…"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={fieldErrors.description}
        />

        <Select label="Tipo" value={kind} options={kindOptions} onChange={setKind} error={fieldErrors.kind} />
      </div>

      <div className="entry-form-row">
        <MoneyField
          label="Valor da parcela"
          value={amount}
          onChange={setAmount}
          error={fieldErrors.installment_amount_cents}
        />

        <TextField
          label="Quantas parcelas"
          name="installments"
          type="number"
          min={1}
          max={600}
          value={installments}
          onChange={(event) => setInstallments(event.target.value)}
          error={fieldErrors.installments}
        />
      </div>

      <div className="entry-form-row">
        <Select
          label="Frequência"
          value={frequency}
          options={frequencyOptions}
          onChange={setFrequency}
          error={fieldErrors.frequency}
        />

        <TextField
          label="Primeira parcela"
          name="first_due_date"
          type="date"
          value={firstDueDate}
          onChange={(event) => setFirstDueDate(event.target.value)}
          error={fieldErrors.first_due_date}
        />
      </div>

      <div className="entry-form-row">
        <CategorySelect
          kind={kind}
          value={categoryId}
          onChange={setCategoryId}
          error={fieldErrors.category_id}
        />

        {totalCents !== null && (
          <p className="entry-form-hint">
            Total da dívida: <strong>{formatMoney(totalCents)}</strong>
          </p>
        )}
      </div>

      {formError && <Alert>{formError}</Alert>}

      <Button type="submit" loading={submitting}>
        Registrar dívida
      </Button>
    </form>
  );
}
