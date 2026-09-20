const TOKEN_KEY = "mnemio.token";

/**
 * Acesso ao token de sessão. Todo uso passa por try/catch: em aba anônima ou
 * com storage bloqueado, o acesso lança e a sessão dura só a aba atual.
 */
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Sessão em memória apenas.
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nada a limpar.
    }
  },
};
