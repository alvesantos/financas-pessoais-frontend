import { expect, test } from "@playwright/test";
import { cadastrar, criarLancamento, hojeISO, irParaLancamentos } from "./fixtures";

test.describe("lançamentos", () => {
  test("cria um lançamento e ele aparece na lista do mês", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "159,90", tipo: "despesa", descricao: "Mercado" });

    const linha = page.locator(".entry", { hasText: "Mercado" });
    await expect(linha).toBeVisible();
    await expect(linha).toContainText("159,90");
  });

  test("sem descrição, o lançamento fica com o nome do tipo", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "50", tipo: "cartao_credito" });

    await expect(
      page.locator(".entry-description", { hasText: "Gasto no cartão de crédito" }),
    ).toBeVisible();
  });

  test("só a receita soma no saldo", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "1000", tipo: "receita" });
    await criarLancamento(page, { valor: "200", tipo: "despesa" });
    await criarLancamento(page, { valor: "100", tipo: "cartao_credito" });
    await criarLancamento(page, { valor: "100", tipo: "investimento" });

    // 1000 - 200 - 100 - 100 = 600
    const previsto = page.locator(".balance", { hasText: "Saldo previsto" });
    await expect(previsto).toContainText("600,00");

    const receitas = page.locator(".balance", { hasText: "Receitas" });
    await expect(receitas).toContainText("1.000,00");
  });

  test("saldo atual ignora o que ainda não aconteceu", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    // Um lançamento com data bem à frente dentro do mesmo mês não pode
    // aparecer no saldo atual, só no previsto.
    const hoje = hojeISO();
    const fimDoMes = `${hoje.slice(0, 8)}28`;

    await criarLancamento(page, { valor: "500", tipo: "receita", data: hoje });
    await criarLancamento(page, { valor: "100", tipo: "despesa", data: fimDoMes, descricao: "Futuro" });

    const previsto = page.locator(".balance", { hasText: "Saldo previsto" });
    await expect(previsto).toContainText("400,00");
  });

  test("a lista é separada por mês", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "80", tipo: "despesa", descricao: "Deste mês" });
    await expect(page.locator(".entry", { hasText: "Deste mês" })).toBeVisible();

    await page.getByRole("button", { name: "Próximo mês" }).click();
    await expect(page.locator(".entry", { hasText: "Deste mês" })).toHaveCount(0);

    await page.getByRole("button", { name: "Mês anterior" }).click();
    await expect(page.locator(".entry", { hasText: "Deste mês" })).toBeVisible();
  });

  test("apagar um lançamento tira ele da lista e do saldo", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "250", tipo: "despesa", descricao: "Engano" });
    await expect(page.locator(".entry", { hasText: "Engano" })).toBeVisible();

    await page.getByRole("button", { name: "Apagar Engano" }).click();

    await expect(page.locator(".entry", { hasText: "Engano" })).toHaveCount(0);
    await expect(page.getByText("Nenhum lançamento neste mês")).toBeVisible();
  });

  test("valor zerado não passa e não chama a API", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await criarLancamento(page, { valor: "0", tipo: "despesa" });

    await expect(page.getByText("informe um valor maior que zero")).toBeVisible();
    await expect(page.getByText("Nenhum lançamento neste mês")).toBeVisible();
  });
});

test.describe("lançamento fixo criado na tela de lançamentos", () => {
  test("marcar como fixo faz o lançamento se repetir nos meses", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await page.getByLabel("Valor").fill("159,90");
    await page.getByLabel("Tipo").selectOption("despesa");
    await page.getByLabel("Descrição (opcional)").fill("Academia");
    await page.getByLabel("É um lançamento fixo").check();
    await page.getByLabel("Com que frequência").selectOption("mensal");
    await page.getByRole("button", { name: "Criar lançamento fixo" }).click();

    const linha = page.locator(".entry", { hasText: "Academia" });
    await expect(linha).toBeVisible();
    await expect(linha).toContainText("Fixo mensal");

    // E continua no mês seguinte, sozinho.
    await page.getByRole("button", { name: "Próximo mês" }).click();
    await expect(page.locator(".entry", { hasText: "Academia" })).toBeVisible();
  });

  test("a frequência só aparece depois de marcar que é fixo", async ({ page }) => {
    await cadastrar(page);
    await irParaLancamentos(page);

    await expect(page.getByLabel("Com que frequência")).toBeHidden();

    await page.getByLabel("É um lançamento fixo").check();
    await expect(page.getByLabel("Com que frequência")).toBeVisible();
  });
});
