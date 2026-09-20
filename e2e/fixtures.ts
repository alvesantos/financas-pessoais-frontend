import { expect, type Page } from "@playwright/test";

/** Conta nova a cada chamada: os testes não disputam o mesmo usuário. */
export function novaConta() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    nome: "Gabe Teste",
    email: `e2e-${id}@teste.com`,
    senha: "senha12345",
  };
}

/** Cria uma conta pela interface e espera o painel abrir. */
export async function cadastrar(page: Page, conta = novaConta()) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Criar agora" }).click();

  await page.getByLabel("Nome").fill(conta.nome);
  await page.getByLabel("E-mail").fill(conta.email);
  await page.getByLabel("Senha").fill(conta.senha);
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page.getByRole("heading", { name: /^Olá,/ })).toBeVisible();

  return conta;
}

/** Entra com uma conta existente. */
export async function entrar(page: Page, email: string, senha: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}
