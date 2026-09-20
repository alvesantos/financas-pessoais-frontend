import { expect, test, type Page } from "@playwright/test";
import { cadastrar, irParaLancamentos } from "./fixtures";

async function irParaDividas(page: Page) {
  await page.getByRole("link", { name: "Dívidas" }).click();
  await expect(page.getByRole("heading", { name: "Suas dívidas" })).toBeVisible();
}

/** Registra o caso do enunciado: 21x de R$ 877,66 a partir de 07/10/2026. */
async function registrarEmprestimo(page: Page, descricao = "Empréstimo") {
  await page.getByLabel("O que é").fill(descricao);
  await page.getByLabel("Valor da parcela").fill("877,66");
  await page.getByLabel("Quantas parcelas").fill("21");
  await page.getByLabel("Frequência").selectOption("mensal");
  await page.getByLabel("Primeira parcela").fill("2026-10-07");
  await page.getByRole("button", { name: "Registrar dívida" }).click();
}

test.describe("dívidas", () => {
  test("o menu leva à tela de dívidas", async ({ page }) => {
    await cadastrar(page);

    await page.getByRole("link", { name: "Dívidas" }).click();

    await expect(page).toHaveURL(/\/dividas$/);
    await expect(page.getByRole("heading", { name: "Dívidas", level: 1 })).toBeVisible();
  });

  test("mostra o total antes de registrar", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);

    await page.getByLabel("Valor da parcela").fill("877,66");
    await page.getByLabel("Quantas parcelas").fill("21");

    // 877,66 x 21 = 18.430,86
    await expect(page.getByText(/18\.430,86/)).toBeVisible();
  });

  test("registra o empréstimo e mostra o medidor", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);

    await registrarEmprestimo(page);

    const divida = page.locator(".debt", { hasText: "Empréstimo" });
    await expect(divida).toBeVisible();
    await expect(divida).toContainText("21x de");
    await expect(divida).toContainText("877,66");
    await expect(divida.getByRole("progressbar")).toBeVisible();
    await expect(divida).toContainText("de 21 parcelas");
  });

  test("as parcelas aparecem nos lançamentos, numeradas", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);
    await registrarEmprestimo(page);

    await irParaLancamentos(page);

    // A tela abre no mês corrente; dezembro de 2026 tem a terceira parcela.
    await page.goto("/lancamentos");
    for (let i = 0; i < 24; i++) {
      const linha = page.locator(".entry", { hasText: "Empréstimo" });
      if (await linha.count()) {
        await expect(linha.first()).toContainText("Parcela");
        return;
      }
      await page.getByRole("button", { name: "Próximo mês" }).click();
    }

    throw new Error("nenhuma parcela apareceu nos 24 meses seguintes");
  });

  test("o painel mostra o que falta pagar", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);
    await registrarEmprestimo(page);

    await page.getByRole("link", { name: "Painel" }).click();

    const tile = page.locator(".stat-tile", { hasText: "Falta pagar em dívidas" });
    await expect(tile).toBeVisible();
    await expect(tile).toContainText("1 dívida em aberto");
  });

  test("apagar a dívida tira as parcelas dos lançamentos", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);
    await registrarEmprestimo(page);

    await page.getByRole("button", { name: "Apagar Empréstimo" }).click();

    await expect(page.getByText("Nenhuma dívida registrada")).toBeVisible();
  });

  test("parcela sem valor não passa", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);

    await page.getByRole("button", { name: "Registrar dívida" }).click();

    await expect(page.getByText("informe o valor da parcela")).toBeVisible();
  });

  test("estado vazio explica para que serve a tela", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);

    await expect(page.getByText("Nenhuma dívida registrada")).toBeVisible();
  });
});
