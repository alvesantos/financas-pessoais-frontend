import { useId } from "react";

interface ColorFieldProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/** Campo de cor na mesma moldura e altura dos outros campos. */
export function ColorField({ label, value, error, onChange }: ColorFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <div className={`field-control color-control${error ? " has-error" : ""}`}>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {/* O código ao lado dá um valor legível à amostra, que sozinha não
            informa qual cor foi escolhida. */}
        <span className="color-value">{value}</span>
      </div>

      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
