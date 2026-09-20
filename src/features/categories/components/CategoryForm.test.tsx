import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "../../../lib/api-error";
import { CategoryForm } from "./CategoryForm";

vi.mock("../api/categories.api", () => ({
  categoriesApi: { create: vi.fn(), list: vi.fn(), remove: vi.fn() },
}));

const { categoriesApi } = await import("../api/categories.api");

const criada = {
  id: 1,
  name: "Mercado",
  kind: "despesa" as const,
  kind_label: "Despesa",
  color: "#6366f1",
};

beforeEach(() => {
  vi.mocked(categoriesApi.create).mockReset().mockResolvedValue(criada);
});

describe("CategoryForm", () => {
  it("envia nome, tipo e cor", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onCreated={vi.fn()} />);

    await user.type(screen.getByLabelText("Nome"), "Mercado");
    await user.selectOptions(screen.getByLabelText("Tipo"), "despesa");
    await user.click(screen.getByRole("button", { name: "Adicionar categoria" }));

    await waitFor(() => {
      expect(categoriesApi.create).toHaveBeenCalledWith({
        name: "Mercado",
        kind: "despesa",
        color: "#6366f1",
      });
    });
  });

  it("mostra o erro por campo devolvido pela API", async () => {
    const user = userEvent.setup();
    vi.mocked(categoriesApi.create).mockRejectedValue(
      new ApiError(422, "dados inválidos", "validation", { name: "informe o nome da categoria" }),
    );

    render(<CategoryForm onCreated={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Adicionar categoria" }));

    expect(await screen.findByText("informe o nome da categoria")).toBeInTheDocument();
  });

  it("mostra o erro geral quando o nome já existe no tipo", async () => {
    const user = userEvent.setup();
    vi.mocked(categoriesApi.create).mockRejectedValue(
      new ApiError(409, "já existe uma categoria com esse nome para este tipo", "conflict"),
    );

    render(<CategoryForm onCreated={vi.fn()} />);
    await user.type(screen.getByLabelText("Nome"), "Mercado");
    await user.click(screen.getByRole("button", { name: "Adicionar categoria" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("já existe uma categoria");
  });

  it("limpa o nome e avisa quem chamou depois de criar", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    render(<CategoryForm onCreated={onCreated} />);
    await user.type(screen.getByLabelText("Nome"), "Mercado");
    await user.click(screen.getByRole("button", { name: "Adicionar categoria" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });
});
