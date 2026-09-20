import { expect, test, type Page } from "@playwright/test";
import { cadastrar, criarLancamento, irParaFixos, irParaLancamentos } from "./fixtures";

async function criarCategoria(page: Page, nome: string, tipo = "despesa") {
  await page.getByRole("link", { name: "Categorias" }).click();
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("Tipo").selectOption(tipo);
  await page.getByRole("button", { name: "Adicionar categoria" }).click();
  await expect(page.locator(".entry", { hasText: nome })).toBeVisible();
}

test.describe("categoria no lançamento", () => {
  test("escolhe a categoria e ela aparece embaixo da descrição", async ({ page }) => {
    await cadastrar(page);
    await criarCategoria(page, "Mercado");
    await irParaLancamentos(page);

    await page.getByLabel("Valor").fill("85,50");
    await page.getByLabel("Tipo").selectOption("despesa");
    await page.getByLabel("Categoria").selectOption({ label: "Mercado" });
    await page.getByLabel("Descrição (opcional)").fill("Feira");
    await page.getByRole("button", { name: "Adicionar lançamento" }).click();

    const linha = page.locator(".entry", { hasText: "Feira" });
    await expect(linha).toBeVisible();
    await expect(linha.locator(".entry-meta")).toContainText("Mercado");
  });

  test("só oferece categorias do tipo escolhido", async ({ page }) => {
    await cadastrar(page);
    await criarCategoria(page, "Mercado", "despesa");
    await criarCategoria(page, "Salário", "receita");
    await irParaLancamentos(page);

    await page.getByLabel("Tipo").selectOption("despesa");
    await expect(page.getByLabel("Categoria").locator("option", { hasText: "Mercado" })).toHaveCount(1);
    await expect(page.getByLabel("Categoria").locator("option", { hasText: "Salário" })).toHaveCount(0);

    await page.getByLabel("Tipo").selectOption("receita");
    await expect(page.getByLabel("Categoria").locator("option", { hasText: "Salário" })).toHaveCount(1);
    await expect(page.getByLabel("Categoria").locator("option", { hasText: "Mercado" })).toHaveCount(0);
  });

  test("lançamento sem categoria continua valendo", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "50", tipo: "despesa", descricao: "Avulso" });

    await expect(page.locator(".entry", { hasText: "Avulso" })).toBeVisible();
  });
});

test.describe("categoria no fixo", () => {
  test("escolhe a categoria e a projeção carrega ela", async ({ page }) => {
    await cadastrar(page);
    await criarCategoria(page, "Academia");
    await irParaFixos(page);

    await page.getByLabel("Valor").fill("159,90");
    await page.getByLabel("Tipo").selectOption("despesa");
    await page.getByLabel("Categoria").selectOption({ label: "Academia" });
    await page.getByLabel("Descrição (opcional)").fill("Academia mensal");
    await page.getByLabel("Frequência").selectOption("mensal");
    await page.getByRole("button", { name: "Adicionar fixo" }).click();

    await expect(
      page.locator(".entry", { hasText: "Academia mensal" }).locator(".entry-meta"),
    ).toContainText("Academia");

    // A projeção na tela de lançamentos precisa trazer a mesma categoria.
    await irParaLancamentos(page);
    await expect(
      page.locator(".entry", { hasText: "Academia mensal" }).locator(".entry-meta"),
    ).toContainText("Academia");
  });
});

test.describe("painel por categoria", () => {
  test("agrupa os gastos pela categoria escolhida", async ({ page }) => {
    await cadastrar(page);
    await criarCategoria(page, "Mercado");
    await irParaLancamentos(page);

    for (const valor of ["300", "500"]) {
      await page.getByLabel("Valor").fill(valor);
      await page.getByLabel("Categoria").selectOption({ label: "Mercado" });
      await page.getByRole("button", { name: "Adicionar lançamento" }).click();
    }

    await page.getByRole("link", { name: "Painel" }).click();

    // As duas compras somam na mesma barra.
    const barra = page.locator(".ranked-bar", { hasText: "Mercado" });
    await expect(barra).toContainText("800,00");
  });
});
