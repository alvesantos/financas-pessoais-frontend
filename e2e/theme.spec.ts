import { expect, test } from "@playwright/test";
import { cadastrar } from "./fixtures";

test.describe("tema", () => {
  test("alterna entre claro e escuro pelo menu", async ({ page }) => {
    await cadastrar(page);

    const html = page.locator("html");
    const temaInicial = await html.getAttribute("data-theme");
    const alvo = temaInicial === "dark" ? "light" : "dark";

    await page
      .getByRole("button", { name: alvo === "dark" ? "Usar tema escuro" : "Usar tema claro" })
      .click();

    await expect(html).toHaveAttribute("data-theme", alvo);
  });

  test("a escolha sobrevive ao recarregar", async ({ page }) => {
    await cadastrar(page);

    const html = page.locator("html");
    const temaInicial = await html.getAttribute("data-theme");
    const alvo = temaInicial === "dark" ? "light" : "dark";

    await page
      .getByRole("button", { name: alvo === "dark" ? "Usar tema escuro" : "Usar tema claro" })
      .click();
    await page.reload();

    // O script em index.html aplica o tema antes da primeira pintura.
    await expect(html).toHaveAttribute("data-theme", alvo);
  });

  test("a tela de login também troca de tema", async ({ page }) => {
    await page.goto("/login");

    const html = page.locator("html");
    const temaInicial = await html.getAttribute("data-theme");
    const alvo = temaInicial === "dark" ? "light" : "dark";

    await page
      .getByRole("button", { name: alvo === "dark" ? "Usar tema escuro" : "Usar tema claro" })
      .click();

    await expect(html).toHaveAttribute("data-theme", alvo);
  });

  test("a marca nova aparece no login e no menu", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Mnemio")).toBeVisible();

    await cadastrar(page);
    await expect(page.locator(".sidebar-name")).toContainText("Mnemio");
  });
});
