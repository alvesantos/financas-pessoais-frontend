import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { MoneyField } from "../../../components/ui/MoneyField";
import { Select } from "../../../components/ui/Select";
import { TextField } from "../../../components/ui/TextField";
import { ApiError, type FieldErrors } from "../../../lib/api-error";
import { formatMoney, parseMoneyToCents } from "../../../lib/money";
import { debtsApi } from "../api/debts.api";
import type { AmortizationMode, Debt } from "../types";

const modeOptions: { value: AmortizationMode; label: string }[] = [
  { value: "manter_parcela", label: "Manter a parcela e encurtar o prazo" },
  { value: "recalcular_parcela", label: "Manter o prazo e baixar a parcela" },
  { value: "recalcular_parcelas", label: "Escolher em quantas parcelas fica" },
];

interface AmortizeDialogProps {
  debt: Debt | null;
  onDone: () => void;
  onClose: () => void;
}

export function AmortizeDialog({ debt, onDone, onClose }: AmortizeDialogProps) {
  const [amount, setAmount] = useState("");
  const [newRemaining, setNewRemaining] = useState("");
  const [mode, setMode] = useState<AmortizationMode>("manter_parcela");
  const [installments, setInstallments] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!debt) return null;

  const amountCents = parseMoneyToCents(amount);
  const newRemainingCents = newRemaining.trim() === "" ? null : parseMoneyToCents(newRemaining);

  // O saldo que sobra: o informado manda; senão, o que falta menos o abatido.
  const previsto =
    newRemainingCents !== null
      ? newRemainingCents
      : amountCents !== null
        ? debt.progress.remaining_cents - amountCents
        : debt.progress.remaining_cents;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");

    if (amountCents === null || amountCents <= 0) {
      setFieldErrors({ amount_cents: "informe um valor maior que zero" });
      return;
    }

    setSubmitting(true);
    try {
      await debtsApi.amortize(debt!.id, {
        amount_cents: amountCents,
        new_remaining_cents: newRemainingCents,
        mode,
        installments: mode === "recalcular_parcelas" ? Number(installments) || null : null,
      });

      onDone();
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
    <Dialog open title={`Amortizar ${debt.description}`} onClose={onClose}>
      <p className="dialog-note">
        Faltam {formatMoney(debt.progress.remaining_cents)} em{" "}
        {debt.progress.remaining_count} parcelas.
      </p>

      <form className="entry-form" onSubmit={handleSubmit} noValidate>
        <MoneyField
          label="Quanto quer amortizar"
          value={amount}
          onChange={setAmount}
          error={fieldErrors.amount_cents}
        />

        <MoneyField
          label="Novo saldo final (opcional)"
          value={newRemaining}
          onChange={setNewRemaining}
          error={fieldErrors.new_remaining_cents}
        />

        <Select label="E as parcelas" value={mode} options={modeOptions} onChange={setMode} />

        {mode === "recalcular_parcelas" && (
          <TextField
            label="Quantas parcelas ficam"
            name="installments"
            type="number"
            min={1}
            value={installments}
            onChange={(event) => setInstallments(event.target.value)}
            error={fieldErrors.installments}
          />
        )}

        <p className="dialog-highlight">
          Saldo devedor depois
          <strong>{formatMoney(Math.max(previsto, 0))}</strong>
        </p>

        {formError && <Alert>{formError}</Alert>}

        <div className="dialog-actions">
          <Button type="submit" loading={submitting}>
            Amortizar
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
