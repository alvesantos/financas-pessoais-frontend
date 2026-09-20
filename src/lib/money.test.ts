import { describe, expect, it } from "vitest";
import { formatMoney, formatSignedMoney, parseMoneyToCents } from "./money";

describe("formatMoney", () => {
  it("formata centavos como reais", () => {
    // O separador de milhar do pt-BR é um espaço estreito, não um espaço comum.
    expect(formatMoney(15990).replace(/ /g, " ")).toBe("R$ 159,90");
    expect(formatMoney(0).replace(/ /g, " ")).toBe("R$ 0,00");
  });

  it("marca o sinal de entrada e de saída", () => {
    expect(formatSignedMoney(15990)).toContain("+");
    expect(formatSignedMoney(-15990)).toContain("-");
    // O valor em si não carrega o sinal, para não sair "- -159,90".
    expect(formatSignedMoney(-15990)).toContain("159,90");
  });
});

describe("parseMoneyToCents", () => {
  it("entende vírgula como separador decimal", () => {
    expect(parseMoneyToCents("159,90")).toBe(15990);
  });

  it("entende ponto como separador decimal", () => {
    expect(parseMoneyToCents("159.90")).toBe(15990);
  });

  it("entende ponto de milhar com vírgula decimal", () => {
    expect(parseMoneyToCents("1.599,90")).toBe(159990);
  });

  it("ignora o símbolo da moeda e os espaços", () => {
    expect(parseMoneyToCents("R$ 159,90")).toBe(15990);
  });

  it("aceita valor inteiro", () => {
    expect(parseMoneyToCents("160")).toBe(16000);
  });

  it("arredonda em vez de herdar o erro do ponto flutuante", () => {
    // 0.1 + 0.2 não é 0.3 em ponto flutuante; em centavos precisa ser exato.
    expect(parseMoneyToCents("1,15")).toBe(115);
    expect(parseMoneyToCents("19,99")).toBe(1999);
  });

  it("devolve null para o que não dá para entender", () => {
    expect(parseMoneyToCents("")).toBeNull();
    expect(parseMoneyToCents("abc")).toBeNull();
    expect(parseMoneyToCents("   ")).toBeNull();
  });
});
