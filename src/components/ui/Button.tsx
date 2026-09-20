import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button {...props} className={`btn btn-${variant}`} disabled={disabled || loading}>
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
