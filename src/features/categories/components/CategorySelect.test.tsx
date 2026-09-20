import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CategorySelect } from "./CategorySelect";

vi.mock("../api/categories.api", () => ({
  categoriesApi: { list: vi.fn(), create: vi.fn(), remove: vi.fn() },
}));

const { categoriesApi } = await import("../api/categories.api");

const categorias = [
  { id: 1, name: "Mercado", kind: "despesa" as const, kind_label: "Despesa", color: "#aabbcc" },
  { id: 2, name: "Transporte", kind: "despesa" as const, kind_label: "Despesa", color: "#ccbbaa" },
  { id: 3, name: "Salário", kind: "receita" as const, kind_label: "Receita", color: "#bbccaa" },
];

beforeEach(() => {
  vi.mocked(categoriesApi.list).mockReset().mockResolvedValue(categorias);
});

describe("CategorySelect", () => {
  it("oferece só as categorias do tipo escolhido", async () => {
    render(<CategorySelect kind="despesa" value={null} onChange={vi.fn()} />);

    await waitFor(() => expect(screen.getByText("Mercado")).toBeInTheDocument());

    expect(screen.getByText("Transporte")).toBeInTheDocument();
    // Salário é de receita: o backend recusaria, então nem aparece.
    expect(screen.queryByText("Salário")).not.toBeInTheDocument();
  });

  it("começa em Sem categoria", async () => {
    render(<CategorySelect kind="despesa" value={null} onChange={vi.fn()} />);

    expect(await screen.findByRole("combobox")).toHaveValue("");
    expect(screen.getByText("Sem categoria")).toBeInTheDocument();
  });

  it("devolve o id ao escolher", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CategorySelect kind="despesa" value={null} onChange={onChange} />);
    await waitFor(() => expect(screen.getByText("Mercado")).toBeInTheDocument());

    await user.selectOptions(screen.getByRole("combobox"), "1");

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("devolve null ao voltar para Sem categoria", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CategorySelect kind="despesa" value={1} onChange={onChange} />);
    await waitFor(() => expect(screen.getByText("Mercado")).toBeInTheDocument());

    await user.selectOptions(screen.getByRole("combobox"), "");

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("limpa a escolha quando o tipo do lançamento muda", async () => {
    const onChange = vi.fn();

    // A categoria 1 é de despesa; com o tipo em receita ela não vale mais.
    render(<CategorySelect kind="receita" value={1} onChange={onChange} />);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(null));
  });

  it("funciona sem nenhuma categoria cadastrada", async () => {
    vi.mocked(categoriesApi.list).mockResolvedValue([]);

    render(<CategorySelect kind="despesa" value={null} onChange={vi.fn()} />);

    expect(await screen.findByText("Sem categoria")).toBeInTheDocument();
  });
});
