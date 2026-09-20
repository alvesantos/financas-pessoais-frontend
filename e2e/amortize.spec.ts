import { expect, test, type Page } from "@playwright/test";
import { cadastrar } from "./fixtures";

async function irParaDividas(page: Page) {
  await page.getByRole("link", { name: "Dívidas" }).click();
  await expect(page.getByRole("heading", { name: "Suas dívidas" })).toBeVisible();
}

async function registrarEmprestimo(page: Page) {
  await page.getByLabel("O que é").fill("Empréstimo");
  await page.getByLabel("Valor da parcela").fill("877,66");
  await page.getByLabel("Quantas parcelas").fill("21");
  await page.getByLabel("Frequência").selectOption("mensal");
  await page.getByLabel("Primeira parcela").fill("2026-10-07");
  await page.getByRole("button", { name: "Registrar dívida" }).click();
  await expect(page.locator(".debt", { hasText: "Empréstimo" })).toBeVisible();
}

test.describe("amortizar", () => {
  test("mostra o saldo devedor resultante enquanto digita", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);
    await registrarEmprestimo(page);

    await page.getByRole("button", { name: "Amortizar" }).click();
    await page.getByLabel("Quanto quer amortizar").fill("1000");

    // 18.430,86 menos 1.000,00
    await expect(page.getByText(/17\.430,86/)).toBeVisible();
  });

  test("amortiza mantendo a parcela e encurtando o prazo", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);
    await registrarEmprestimo(page);

    await page.getByRole("button", { name: "Amortizar" }).click();
    await page.getByLabel("Quanto quer amortizar").fill("1755,32");
    await page.getByRole("button", { name: "Amortizar", exact: true }).last().click();

    const divida = page.locator(".debt", { hasText: "Empréstimo" });
    await expect(divida).toContainText("19x de");
  });

  test("editar a dívida muda o total", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);
    await registrarEmprestimo(page);

    await page.getByRole("button", { name: "Editar Empréstimo" }).click();
    await page.getByLabel("Quantas parcelas").fill("10");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.locator(".debt", { hasText: "Empréstimo" })).toContainText("10x de");
  });
});

test.describe("quitar", () => {
  test("pergunta em dois passos e quita sem mexer no saldo", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);
    await registrarEmprestimo(page);

    await page.getByRole("button", { name: "Quitar" }).click();
    await expect(page.getByText("Quitar dívida")).toBeVisible();

    await page.getByRole("button", { name: "Sim, foi quitada" }).click();
    await expect(page.getByText("Descontar do saldo?")).toBeVisible();

    await page.getByRole("button", { name: "Não, só quitar" }).click();

    await expect(page.locator(".debt", { hasText: "Empréstimo" })).toContainText("Quitada");
  });

  test("responder não na primeira pergunta não quita", async ({ page }) => {
    await cadastrar(page);
    await irParaDividas(page);
    await registrarEmprestimo(page);

    await page.getByRole("button", { name: "Quitar" }).click();
    await page.getByRole("button", { name: "Não", exact: true }).click();

    await expect(page.locator(".debt", { hasText: "Empréstimo" })).not.toContainText("Quitada");
  });
});
