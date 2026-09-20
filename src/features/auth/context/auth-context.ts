import { createContext } from "react";
import type { LoginInput, RegisterInput, User } from "../types";

export interface AuthContextValue {
  user: User | null;
  /** true enquanto a sessão salva ainda está sendo restaurada. */
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
