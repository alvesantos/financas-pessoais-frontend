import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { tokenStorage } from "../../../lib/token-storage";
import { authApi } from "../api/auth.api";
import type { LoginInput, RegisterInput, Session, User } from "../types";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Só há sessão a restaurar se existe um token salvo.
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null);

  // Valida o token salvo contra a API antes de liberar as rotas privadas.
  useEffect(() => {
    if (!tokenStorage.get()) return;

    const controller = new AbortController();

    authApi
      .me(controller.signal)
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        tokenStorage.clear();
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const startSession = useCallback((session: Session) => {
    tokenStorage.set(session.token);
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => startSession(await authApi.login(input)),
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => startSession(await authApi.register(input)),
    [startSession],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: user !== null, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
