import { expect, test } from "@playwright/test";
import { cadastrar, criarLancamento, irParaLancamentos } from "./fixtures";

test.describe("painel", () => {
  test("é a tela inicial de quem entra", async ({ page }) => {
    await cadastrar(page);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Painel", level: 1 })).toBeVisible();
  });

  test("conta novo começa zerado, sem gráfico vazio na tela", async ({ page }) => {
    await cadastrar(page);

    await expect(page.getByText(/Sem movimentação em/)).toBeVisible();
    await expect(page.getByText("Nenhum gasto neste mês.")).toBeVisible();
  });

  test("as métricas acompanham os lançamentos", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "5000", tipo: "receita", descricao: "Salário" });
    await criarLancamento(page, { valor: "900", tipo: "despesa", descricao: "Mercado" });
    await criarLancamento(page, { valor: "500", tipo: "cartao_credito", descricao: "Cartão" });

    await page.getByRole("link", { name: "Painel" }).click();

    const saldoDoAno = page.locator(".stat-tile", { hasText: "Saldo de" });
    await expect(saldoDoAno).toContainText("3.600,00");

    const despesasDoMes = page.locator(".stat-tile", { hasText: "Despesas do mês" });
    await expect(despesasDoMes).toContainText("1.400,00");
  });

  test("o gráfico de gastos ordena do maior para o menor", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "200", tipo: "investimento" });
    await criarLancamento(page, { valor: "900", tipo: "despesa" });
    await criarLancamento(page, { valor: "500", tipo: "cartao_credito" });

    await page.getByRole("link", { name: "Painel" }).click();

    const barras = page.locator(".ranked-bar-label");
    await expect(barras.nth(0)).toHaveText("Despesa");
    await expect(barras.nth(1)).toHaveText("Gasto no cartão de crédito");
    await expect(barras.nth(2)).toHaveText("Investimento");
  });

  test("o gráfico do ano também traz os números em tabela", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "5000", tipo: "receita" });

    await page.getByRole("link", { name: "Painel" }).click();

    // Quem não lê o gráfico precisa conseguir ler os dados.
    await page.getByText("Ver os números").click();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("destaca o maior gasto do mês", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "9000", tipo: "receita", descricao: "Salário" });
    await criarLancamento(page, { valor: "2000", tipo: "despesa", descricao: "Aluguel" });
    await criarLancamento(page, { valor: "300", tipo: "despesa", descricao: "Mercado" });

    await page.getByRole("link", { name: "Painel" }).click();

    // O salário é maior, mas não é gasto.
    await expect(page.getByText(/Maior gasto do mês/)).toContainText("Aluguel");
  });
});
