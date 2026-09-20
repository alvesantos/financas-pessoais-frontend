import { useState } from "react";
import { Logo } from "../../../components/ui/Logo";
import { AuthForm, type AuthMode } from "../components/AuthForm";
import "./LoginPage.css";

const copy: Record<AuthMode, { title: string; subtitle: string; switchTo: string; cta: string }> = {
  login: {
    title: "Bem-vindo de volta",
    subtitle: "Entre para ver suas finanças.",
    switchTo: "Ainda não tem conta?",
    cta: "Criar agora",
  },
  register: {
    title: "Criar conta",
    subtitle: "Leva menos de um minuto para começar.",
    switchTo: "Já tem uma conta?",
    cta: "Entrar",
  },
};

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const text = copy[mode];

  return (
    <main className="auth">
      <div className="auth-card">
        <header className="auth-header">
          <Logo />
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </header>

        {/* A key remonta o formulário ao trocar de modo, limpando os campos. */}
        <AuthForm key={mode} mode={mode} />

        <footer className="auth-footer">
          {text.switchTo}{" "}
          <button
            type="button"
            className="link"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {text.cta}
          </button>
        </footer>
      </div>

      <p className="auth-legal">Finanças pessoais, sem ruído.</p>
    </main>
  );
}
