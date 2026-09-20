import type { ReactNode } from "react";

/** Mensagem de erro do formulário inteiro, anunciada por leitores de tela. */
export function Alert({ children }: { children: ReactNode }) {
  return (
    <p className="alert" role="alert">
      {children}
    </p>
  );
}
