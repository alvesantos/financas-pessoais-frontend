import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { TextField } from "../../../components/ui/TextField";
import { ApiError, type FieldErrors } from "../../../lib/api-error";
import { allKinds, kindLabels } from "../../../types/finance";
import type { Kind } from "../../../types/finance";
import { categoriesApi } from "../api/categories.api";

const kindOptions = allKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }));

const DEFAULT_COLOR = "#6366f1";

export function CategoryForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("despesa");
  const [color, setColor] = useState(DEFAULT_COLOR);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");
    setSubmitting(true);

    try {
      await categoriesApi.create({ name, kind, color });

      setName("");
      setColor(DEFAULT_COLOR);
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
          label="Nome"
          name="name"
          placeholder="Mercado, transporte, salário…"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
        />

        <Select label="Tipo" value={kind} options={kindOptions} onChange={setKind} error={fieldErrors.kind} />
      </div>

      <div className="color-picker">
        <label className="field-label" htmlFor="category-color">
          Cor
        </label>
        <input
          id="category-color"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          aria-describedby={fieldErrors.color ? "category-color-error" : undefined}
        />
        {fieldErrors.color && (
          <p className="field-error" id="category-color-error" role="alert">
            {fieldErrors.color}
          </p>
        )}
      </div>

      {formError && <Alert>{formError}</Alert>}

      <Button type="submit" loading={submitting}>
        Adicionar categoria
      </Button>
    </form>
  );
}
