import { expect, test } from "@playwright/test";
import { cadastrar, entrar, novaConta } from "./fixtures";

test.describe("cadastro", () => {
  test("cria a conta e abre o painel", async ({ page }) => {
    const conta = await cadastrar(page);

    await expect(page.getByRole("heading", { name: "Painel", level: 1 })).toBeVisible();
    await expect(page.getByText(conta.nome)).toBeVisible();
  });

  test("mostra o erro de senha curta no campo", async ({ page }) => {
    const conta = novaConta();

    await page.goto("/login");
    await page.getByRole("button", { name: "Criar agora" }).click();

    await page.getByLabel("Nome").fill(conta.nome);
    await page.getByLabel("E-mail").fill(conta.email);
    await page.getByLabel("Senha").fill("curta");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("a senha precisa de ao menos 8 caracteres")).toBeVisible();
    await expect(page.getByLabel("Senha")).toHaveAttribute("aria-invalid", "true");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("recusa e-mail já cadastrado", async ({ page }) => {
    const conta = await cadastrar(page);
    await page.getByRole("button", { name: "Sair" }).click();

    await page.getByRole("button", { name: "Criar agora" }).click();
    await page.getByLabel("Nome").fill("Outro Nome");
    await page.getByLabel("E-mail").fill(conta.email);
    await page.getByLabel("Senha").fill("outrasenha1");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("e-mail já cadastrado")).toBeVisible();
  });
});

test.describe("login", () => {
  test("entra com as credenciais corretas", async ({ page }) => {
    const conta = await cadastrar(page);
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible();

    await entrar(page, conta.email, conta.senha);

    await expect(page.getByRole("heading", { name: "Painel", level: 1 })).toBeVisible();
  });

  test("mostra erro geral com senha errada", async ({ page }) => {
    const conta = await cadastrar(page);
    await page.getByRole("button", { name: "Sair" }).click();

    await entrar(page, conta.email, "senha-errada");

    await expect(page.getByRole("alert")).toHaveText("e-mail ou senha incorretos");
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible();
  });

  test("dá a mesma resposta para e-mail inexistente", async ({ page }) => {
    // O usuário não deve conseguir descobrir quais e-mails estão cadastrados.
    await entrar(page, "ninguem-existe@teste.com", "senha12345");

    await expect(page.getByRole("alert")).toHaveText("e-mail ou senha incorretos");
  });
});

test.describe("sessão", () => {
  test("mantém o usuário logado depois de recarregar", async ({ page }) => {
    await cadastrar(page);

    await page.reload();

    await expect(page.getByRole("heading", { name: "Painel", level: 1 })).toBeVisible();
  });

  test("manda visitante para o login ao abrir o painel", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible();
  });

  test("tira do login quem já tem sessão", async ({ page }) => {
    await cadastrar(page);

    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Painel", level: 1 })).toBeVisible();
  });

  test("sair limpa a sessão e bloqueia o painel", async ({ page }) => {
    await cadastrar(page);

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible();

    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });
});
