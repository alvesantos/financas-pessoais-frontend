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

  await expect(page.getByRole("heading", { name: "Painel", level: 1 })).toBeVisible();

  return conta;
}

/** Entra com uma conta existente. */
export async function entrar(page: Page, email: string, senha: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

/** Abre a tela de lançamentos a partir do menu. */
export async function irParaLancamentos(page: Page) {
  await page.getByRole("link", { name: "Lançamentos" }).click();
  await expect(page.getByRole("heading", { name: "Lançamentos do mês" })).toBeVisible();
}

/** Abre a tela de fixos a partir do menu. */
export async function irParaFixos(page: Page) {
  await page.getByRole("link", { name: "Fixos" }).click();
  await expect(page.getByRole("heading", { name: "Seus fixos" })).toBeVisible();
}

interface NovoLancamento {
  valor: string;
  tipo?: string;
  descricao?: string;
  data?: string;
}

/** Preenche e envia o formulário de lançamento avulso. */
export async function criarLancamento(page: Page, { valor, tipo, descricao, data }: NovoLancamento) {
  await page.getByLabel("Valor").fill(valor);
  if (tipo) await page.getByLabel("Tipo").selectOption(tipo);
  if (descricao) await page.getByLabel("Descrição (opcional)").fill(descricao);
  if (data) await page.getByLabel("Data").fill(data);

  await page.getByRole("button", { name: "Adicionar lançamento" }).click();
}

/** Data de hoje no formato dos campos de data. */
export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}
