import { expect, test } from "@playwright/test";
import { cadastrar } from "./fixtures";

async function irParaCategorias(page: import("@playwright/test").Page) {
  await page.getByRole("link", { name: "Categorias" }).click();
  await expect(page.getByRole("heading", { name: "Suas categorias" })).toBeVisible();
}

async function criarCategoria(
  page: import("@playwright/test").Page,
  nome: string,
  tipo = "despesa",
) {
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("Tipo").selectOption(tipo);
  await page.getByRole("button", { name: "Adicionar categoria" }).click();
}

test.describe("categorias", () => {
  test("o menu leva à tela de categorias", async ({ page }) => {
    await cadastrar(page);

    await page.getByRole("link", { name: "Categorias" }).click();

    await expect(page).toHaveURL(/\/categorias$/);
    await expect(page.getByRole("heading", { name: "Categorias", level: 1 })).toBeVisible();
  });

  test("cadastra uma categoria e ela aparece na lista", async ({ page }) => {
    await cadastrar(page);
    await irParaCategorias(page);

    await criarCategoria(page, "Mercado");

    const linha = page.locator(".entry", { hasText: "Mercado" });
    await expect(linha).toBeVisible();
    await expect(linha).toContainText("Despesa");
  });

  test("o mesmo nome não repete dentro do tipo, mas vale em outro", async ({ page }) => {
    await cadastrar(page);
    await irParaCategorias(page);

    await criarCategoria(page, "Mercado", "despesa");
    await expect(page.locator(".entry", { hasText: "Mercado" })).toHaveCount(1);

    await criarCategoria(page, "Mercado", "despesa");
    await expect(page.getByRole("alert")).toContainText("já existe uma categoria");

    await criarCategoria(page, "Mercado", "receita");
    await expect(page.locator(".entry", { hasText: "Mercado" })).toHaveCount(2);
  });

  test("nome em branco não passa", async ({ page }) => {
    await cadastrar(page);
    await irParaCategorias(page);

    await page.getByRole("button", { name: "Adicionar categoria" }).click();

    await expect(page.getByText("informe o nome da categoria")).toBeVisible();
  });

  test("apagar tira a categoria da lista", async ({ page }) => {
    await cadastrar(page);
    await irParaCategorias(page);

    await criarCategoria(page, "Transporte");
    await expect(page.locator(".entry", { hasText: "Transporte" })).toBeVisible();

    await page.getByRole("button", { name: "Apagar Transporte" }).click();

    await expect(page.getByText("Nenhuma categoria cadastrada")).toBeVisible();
  });

  test("estado vazio explica para que serve a tela", async ({ page }) => {
    await cadastrar(page);
    await irParaCategorias(page);

    await expect(page.getByText("Nenhuma categoria cadastrada")).toBeVisible();
  });
});

test.describe("menu lateral", () => {
  test("recolhe, expande e lembra a escolha", async ({ page }) => {
    await cadastrar(page);

    await page.getByRole("button", { name: "Recolher menu" }).click();
    await expect(page.getByRole("button", { name: "Expandir menu" })).toBeVisible();

    // A escolha sobrevive à navegação e ao recarregar.
    await page.reload();
    await expect(page.getByRole("button", { name: "Expandir menu" })).toBeVisible();

    await page.getByRole("button", { name: "Expandir menu" }).click();
    await expect(page.getByRole("button", { name: "Recolher menu" })).toBeVisible();
  });

  test("recolhido, os links continuam navegando", async ({ page }) => {
    await cadastrar(page);

    await page.getByRole("button", { name: "Recolher menu" }).click();
    await page.getByRole("link", { name: "Categorias" }).click();

    await expect(page).toHaveURL(/\/categorias$/);
  });
});
