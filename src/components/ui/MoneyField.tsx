import { useId, type InputHTMLAttributes } from "react";

interface MoneyFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "onChange" | "value" | "type"> {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/**
 * Campo de valor em reais. Guarda o texto cru e deixa a conversão para
 * centavos com quem envia — assim a pessoa digita à vontade enquanto escreve.
 */
export function MoneyField({ label, value, error, onChange, ...props }: MoneyFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <div className={`field-control money-control${error ? " has-error" : ""}`}>
        <span className="money-prefix" aria-hidden="true">
          R$
        </span>
        <input
          {...props}
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>

      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
