import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";
import { ApiError, type FieldErrors } from "../../../lib/api-error";
import { useAuth } from "../hooks/useAuth";

export type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

/** Formulário de entrada e de cadastro: os campos mudam, o fluxo não. */
export function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fields);
        // Erros por campo já aparecem embaixo do input.
        if (!error.hasFieldErrors) setFormError(error.message);
      } else {
        setFormError("Algo deu errado. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {isRegister && (
        <TextField
          label="Nome"
          name="name"
          autoComplete="name"
          placeholder="Como você se chama"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
          required
        />
      )}

      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
        required
      />

      <TextField
        label="Senha"
        name="password"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        placeholder={isRegister ? "Mínimo de 8 caracteres" : "••••••••"}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        required
      />

      {formError && <Alert>{formError}</Alert>}

      <Button type="submit" loading={submitting}>
        {isRegister ? "Criar conta" : "Entrar"}
      </Button>
    </form>
  );
}
