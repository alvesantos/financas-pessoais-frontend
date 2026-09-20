import { expect, test, type Page } from "@playwright/test";
import { cadastrar, irParaLancamentos } from "./fixtures";

async function irParaCartoes(page: Page) {
  await page.getByRole("link", { name: "Cartões" }).click();
  await expect(page.getByRole("heading", { name: "Seus cartões" })).toBeVisible();
}

async function cadastrarCartao(page: Page, nome: string, melhorDia = "5") {
  await page.getByLabel("Nome do cartão").fill(nome);
  await page.getByLabel("Limite").fill("5000");
  await page.getByLabel("Melhor dia para compras").fill(melhorDia);
  await page.getByLabel("Dia do vencimento").fill("15");
  await page.getByRole("button", { name: "Adicionar cartão" }).click();
  await expect(page.locator(".entry", { hasText: nome })).toBeVisible();
}

test.describe("cartões", () => {
  test("o menu leva à tela de cartões", async ({ page }) => {
    await cadastrar(page);

    await page.getByRole("link", { name: "Cartões" }).click();

    await expect(page).toHaveURL(/\/cartoes$/);
    await expect(page.getByRole("heading", { name: "Cartões", level: 1 })).toBeVisible();
  });

  test("cadastra e edita um cartão", async ({ page }) => {
    await cadastrar(page);
    await irParaCartoes(page);

    await cadastrarCartao(page, "Nubank");

    const linha = page.locator(".entry", { hasText: "Nubank" });
    await expect(linha).toContainText("Melhor dia 5");
    await expect(linha).toContainText("50,00");

    await page.getByRole("button", { name: "Editar Nubank" }).click();
    await page.getByLabel("Nome do cartão").fill("Nubank Ultra");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.locator(".entry", { hasText: "Nubank Ultra" })).toBeVisible();
  });

  test("o cartão aparece no lançamento de cartão de crédito", async ({ page }) => {
    await cadastrar(page);
    await irParaCartoes(page);
    await cadastrarCartao(page, "Nubank");

    await irParaLancamentos(page);

    // Fora do cartão de crédito, o campo nem aparece.
    await expect(page.getByLabel("Cartão")).toHaveCount(0);

    await page.getByLabel("Tipo").selectOption("cartao_credito");
    await expect(page.getByLabel("Entra em")).toBeVisible();

    await page.getByLabel("Valor").fill("120");
    await page.getByLabel("Descrição (opcional)").fill("Compra");
    await page.getByRole("button", { name: "Adicionar lançamento" }).click();

    await expect(page.locator(".entry", { hasText: "Compra" })).toBeVisible();
  });

  test("estado vazio explica para que serve a tela", async ({ page }) => {
    await cadastrar(page);
    await irParaCartoes(page);

    await expect(page.getByText("Nenhum cartão cadastrado")).toBeVisible();
  });
});
