import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { MoneyField } from "../../../components/ui/MoneyField";
import { TextField } from "../../../components/ui/TextField";
import { ApiError, type FieldErrors } from "../../../lib/api-error";
import { parseMoneyToCents } from "../../../lib/money";
import { cardsApi } from "../api/cards.api";
import type { CreditCard } from "../types";

interface CardFormProps {
  /** Quando presente, o formulário edita em vez de cadastrar. */
  editing?: CreditCard | null;
  onSaved: () => void;
  onCancelEdit?: () => void;
}

export function CardForm({ editing = null, onSaved, onCancelEdit }: CardFormProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [limit, setLimit] = useState(() =>
    editing ? (editing.limit_cents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [bestDay, setBestDay] = useState(String(editing?.best_purchase_day ?? 1));
  const [dueDay, setDueDay] = useState(String(editing?.due_day ?? 10));

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");
    setSubmitting(true);

    const payload = {
      name,
      limit_cents: parseMoneyToCents(limit) ?? 0,
      best_purchase_day: Number(bestDay),
      due_day: Number(dueDay),
    };

    try {
      if (editing) {
        await cardsApi.update(editing.id, payload);
      } else {
        await cardsApi.create(payload);
        setName("");
        setLimit("");
      }

      onSaved();
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
          label="Nome do cartão"
          name="name"
          placeholder="Nubank, Itaú, Inter…"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
        />

        <MoneyField label="Limite" value={limit} onChange={setLimit} error={fieldErrors.limit_cents} />
      </div>

      <div className="entry-form-row">
        <TextField
          label="Melhor dia para compras"
          name="best_purchase_day"
          type="number"
          min={1}
          max={31}
          value={bestDay}
          onChange={(event) => setBestDay(event.target.value)}
          error={fieldErrors.best_purchase_day}
        />

        <TextField
          label="Dia do vencimento"
          name="due_day"
          type="number"
          min={1}
          max={31}
          value={dueDay}
          onChange={(event) => setDueDay(event.target.value)}
          error={fieldErrors.due_day}
        />
      </div>

      <p className="entry-form-hint">
        Comprar no melhor dia ou depois dele joga a compra para a fatura seguinte.
      </p>

      {formError && <Alert>{formError}</Alert>}

      <div className="entry-form-actions">
        <Button type="submit" loading={submitting}>
          {editing ? "Salvar alterações" : "Adicionar cartão"}
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
