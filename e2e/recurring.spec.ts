import { expect, test } from "@playwright/test";
import { cadastrar, irParaFixos, irParaLancamentos } from "./fixtures";

async function criarFixo(
  page: import("@playwright/test").Page,
  { valor, descricao, frequencia, tipo, inicio }: {
    valor: string;
    descricao?: string;
    frequencia?: string;
    tipo?: string;
    inicio?: string;
  },
) {
  await page.getByLabel("Valor").fill(valor);
  if (tipo) await page.getByLabel("Tipo").selectOption(tipo);
  if (descricao) await page.getByLabel("Descrição (opcional)").fill(descricao);
  if (frequencia) await page.getByLabel("Frequência").selectOption(frequencia);
  if (inicio) await page.getByLabel("Começa em").fill(inicio);

  await page.getByRole("button", { name: "Adicionar fixo" }).click();
}

test.describe("fixos", () => {
  test("o menu leva à tela de fixos", async ({ page }) => {
    await cadastrar(page);

    await page.getByRole("link", { name: "Fixos" }).click();

    await expect(page).toHaveURL(/\/fixos$/);
    await expect(page.getByRole("heading", { name: "Fixos", level: 1 })).toBeVisible();
  });

  test("cadastra a academia todo dia 20 e ela aparece nos lançamentos", async ({ page }) => {
    await cadastrar(page);
    await irParaFixos(page);

    // O caso do enunciado: Academia, todo dia 20, R$ 159,90.
    const hoje = new Date();
    const inicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-20`;

    await criarFixo(page, {
      valor: "159,90",
      descricao: "Academia",
      frequencia: "mensal",
      tipo: "despesa",
      inicio,
    });

    await expect(page.locator(".entry", { hasText: "Academia" })).toBeVisible();

    await irParaLancamentos(page);

    const linha = page.locator(".entry", { hasText: "Academia" });
    await expect(linha).toBeVisible();
    await expect(linha).toContainText("20");
    await expect(linha).toContainText("159,90");
    await expect(linha).toContainText("Fixo mensal");
  });

  test("sem descrição, o fixo fica com o nome do tipo", async ({ page }) => {
    await cadastrar(page);
    await irParaFixos(page);

    await criarFixo(page, { valor: "99,90", tipo: "investimento", frequencia: "mensal" });

    await expect(page.locator(".entry-description", { hasText: "Investimento" })).toBeVisible();
  });

  test("apagar o fixo tira as projeções dos lançamentos", async ({ page }) => {
    await cadastrar(page);
    await irParaFixos(page);

    await criarFixo(page, { valor: "159,90", descricao: "Academia", frequencia: "mensal", tipo: "despesa" });
    await expect(page.locator(".entry", { hasText: "Academia" })).toBeVisible();

    await page.getByRole("button", { name: "Apagar Academia" }).click();
    await expect(page.getByText("Nenhum fixo cadastrado")).toBeVisible();

    await irParaLancamentos(page);
    await expect(page.locator(".entry", { hasText: "Academia" })).toHaveCount(0);
  });

  test("um fixo de receita soma no saldo do mês", async ({ page }) => {
    await cadastrar(page);
    await irParaFixos(page);

    const hoje = new Date();
    const inicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-05`;

    await criarFixo(page, {
      valor: "5000",
      descricao: "Salário",
      frequencia: "mensal",
      tipo: "receita",
      inicio,
    });

    await irParaLancamentos(page);

    const previsto = page.locator(".balance", { hasText: "Saldo previsto" });
    await expect(previsto).toContainText("5.000,00");
  });

  test("estado vazio explica para que serve a tela", async ({ page }) => {
    await cadastrar(page);
    await irParaFixos(page);

    await expect(page.getByText("Nenhum fixo cadastrado")).toBeVisible();
  });
});
