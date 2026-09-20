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

  test("o saldo atual acompanha o que já foi pago e recebido", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "5000", tipo: "receita", descricao: "Salário" });
    await criarLancamento(page, { valor: "900", tipo: "despesa", descricao: "Mercado" });
    await criarLancamento(page, { valor: "500", tipo: "cartao_credito", descricao: "Cartão" });

    await page.getByRole("link", { name: "Painel" }).click();

    // 5000 - 900 - 500 = 3600
    const saldoAtual = page.locator(".stat-tile", { hasText: "Saldo atual" });
    await expect(saldoAtual).toContainText("3.600,00");
  });

  test("despesas fixas mostram o custo de vida do mês", async ({ page }) => {
    await cadastrar(page);

    await page.getByRole("link", { name: "Fixos" }).click();
    await page.getByLabel("Valor").fill("159,90");
    await page.getByLabel("Descrição (opcional)").fill("Academia");
    await page.getByLabel("Tipo").selectOption("despesa");
    await page.getByLabel("Frequência").selectOption("mensal");
    await page.getByRole("button", { name: "Adicionar fixo" }).click();
    await expect(page.locator(".entry", { hasText: "Academia" })).toBeVisible();

    await page.getByRole("link", { name: "Painel" }).click();

    const fixas = page.locator(".stat-tile", { hasText: "Despesas fixas" });
    await expect(fixas).toContainText("159,90");
    await expect(fixas).toContainText("Seu custo de vida atual");
  });

  test("não traz mais os números do mês que confundiam com o saldo atual", async ({ page }) => {
    await cadastrar(page);

    await expect(page.getByText("Saldo atual do mês")).toHaveCount(0);
    await expect(page.getByText("Saldo previsto do mês")).toHaveCount(0);
    await expect(page.getByText("Despesas do mês")).toHaveCount(0);
  });

  test("gastos sem categoria caem no balde Sem categoria", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "900", tipo: "despesa" });

    await page.getByRole("link", { name: "Painel" }).click();

    await expect(page.locator(".ranked-bar-label").first()).toContainText("Sem categoria");
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
