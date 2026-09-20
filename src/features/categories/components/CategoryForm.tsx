import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { ColorField } from "../../../components/ui/ColorField";
import { Select } from "../../../components/ui/Select";
import { TextField } from "../../../components/ui/TextField";
import { ApiError, type FieldErrors } from "../../../lib/api-error";
import { allKinds, kindLabels } from "../../../types/finance";
import type { Kind } from "../../../types/finance";
import { categoriesApi } from "../api/categories.api";
import type { Category } from "../types";

const kindOptions = allKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }));

const DEFAULT_COLOR = "#6366f1";

interface CategoryFormProps {
  /** Quando presente, o formulário edita em vez de criar. */
  editing?: Category | null;
  onCreated: () => void;
  onCancelEdit?: () => void;
}

export function CategoryForm({ editing = null, onCreated, onCancelEdit }: CategoryFormProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [kind, setKind] = useState<Kind>(editing?.kind ?? "despesa");
  const [color, setColor] = useState(editing?.color ?? DEFAULT_COLOR);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");
    setSubmitting(true);

    try {
      if (editing) {
        await categoriesApi.update(editing.id, { name, kind, color });
      } else {
        await categoriesApi.create({ name, kind, color });
        setName("");
        setColor(DEFAULT_COLOR);
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

      <div className="entry-form-row">
        <ColorField label="Cor" value={color} onChange={setColor} error={fieldErrors.color} />
      </div>

      {formError && <Alert>{formError}</Alert>}

      <div className="entry-form-actions">
        <Button type="submit" loading={submitting}>
          {editing ? "Salvar alterações" : "Adicionar categoria"}
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
