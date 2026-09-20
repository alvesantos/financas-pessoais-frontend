import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { ThemeProvider } from "../features/theme/context/ThemeProvider";

interface Options extends Omit<RenderOptions, "wrapper"> {
  /** Rota inicial do MemoryRouter. */
  route?: string;
}

/**
 * Renderiza com os providers reais da aplicação. Só a camada de API é
 * mockada nos testes — o resto roda de verdade.
 */
export function renderWithProviders(ui: ReactElement, { route = "/", ...options }: Options = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Reexporta as APIs da Testing Library para que os testes importem de um
// lugar só. Não é um módulo de componentes, apesar da extensão .tsx.
// eslint-disable-next-line react/only-export-components
export * from "@testing-library/react";
