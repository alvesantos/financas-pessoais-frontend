import { useId, type SelectHTMLAttributes } from "react";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "onChange" | "value"> {
  label: string;
  value: T;
  options: Option<T>[];
  error?: string;
  onChange: (value: T) => void;
}

export function Select<T extends string>({
  label,
  value,
  options,
  error,
  onChange,
  ...props
}: SelectProps<T>) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <div className={`field-control${error ? " has-error" : ""}`}>
        <select
          {...props}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
