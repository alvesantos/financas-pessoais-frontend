import { useId, useState, type InputHTMLAttributes } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
}

export function TextField({ label, error, type = "text", ...props }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <div className={`field-control${error ? " has-error" : ""}`}>
        <input
          {...props}
          id={id}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />

        {isPassword && (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Ocultar senha" : "Mostrar senha"}
          >
            {revealed ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>

      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
