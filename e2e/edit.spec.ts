import { expect, test, type Page } from "@playwright/test";
import { cadastrar, criarLancamento, irParaFixos, irParaLancamentos } from "./fixtures";

async function irParaCategorias(page: Page) {
  await page.getByRole("link", { name: "Categorias" }).click();
  await expect(page.getByRole("heading", { name: "Suas categorias" })).toBeVisible();
}

test.describe("editar", () => {
  test("edita um lançamento pelo lápis", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "85,50", tipo: "despesa", descricao: "Mercado" });

    await page.getByRole("button", { name: "Editar Mercado" }).click();
    await expect(page.getByRole("heading", { name: "Editar lançamento" })).toBeVisible();

    await page.getByLabel("Descrição (opcional)").fill("Feira");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.locator(".entry", { hasText: "Feira" })).toBeVisible();
    await expect(page.locator(".entry", { hasText: "Mercado" })).toHaveCount(0);
  });

  test("cancelar volta ao formulário de novo lançamento", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "50", tipo: "despesa", descricao: "Teste" });

    await page.getByRole("button", { name: "Editar Teste" }).click();
    await page.getByRole("button", { name: "Cancelar" }).click();

    await expect(page.getByRole("heading", { name: "Novo lançamento" })).toBeVisible();
  });

  test("edita uma categoria", async ({ page }) => {
    await cadastrar(page);
    await irParaCategorias(page);

    await page.getByLabel("Nome").fill("Mercado");
    await page.getByRole("button", { name: "Adicionar categoria" }).click();
    await expect(page.locator(".entry", { hasText: "Mercado" })).toBeVisible();

    await page.getByRole("button", { name: "Editar Mercado" }).click();
    await page.getByLabel("Nome").fill("Supermercado");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.locator(".entry", { hasText: "Supermercado" })).toBeVisible();
  });

  test("edita um fixo e a projeção acompanha", async ({ page }) => {
    await cadastrar(page);
    await irParaFixos(page);

    await page.getByLabel("Valor").fill("159,90");
    await page.getByLabel("Descrição (opcional)").fill("Academia");
    await page.getByLabel("Frequência").selectOption("mensal");
    await page.getByRole("button", { name: "Adicionar fixo" }).click();
    await expect(page.locator(".entry", { hasText: "Academia" })).toBeVisible();

    await page.getByRole("button", { name: "Editar Academia" }).click();
    await page.getByLabel("Valor").fill("199,90");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.locator(".entry", { hasText: "Academia" })).toContainText("199,90");

    await irParaLancamentos(page);
    await expect(page.locator(".entry", { hasText: "Academia" })).toContainText("199,90");
  });
});

test.describe("marcar como pago", () => {
  test("um clique tira o lançamento de pendente e soma no saldo atual", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await page.getByLabel("Valor").fill("100");
    await page.getByLabel("Tipo").selectOption("despesa");
    await page.getByLabel("Descrição (opcional)").fill("Conta de luz");
    await page.getByLabel("Já paguei").uncheck();
    await page.getByRole("button", { name: "Adicionar lançamento" }).click();

    const linha = page.locator(".entry", { hasText: "Conta de luz" });
    await expect(linha).toContainText("A pagar");

    const atual = page.locator(".balance", { hasText: "Saldo atual" });
    await expect(atual).toContainText("0,00");

    await page.getByRole("button", { name: "Marcar Conta de luz como pago" }).click();

    await expect(linha).not.toContainText("A pagar");
    await expect(atual).toContainText("100,00");
  });
});
