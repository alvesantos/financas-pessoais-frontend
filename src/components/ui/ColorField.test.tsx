import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ColorField } from "./ColorField";

describe("ColorField", () => {
  it("associa o rótulo ao campo", () => {
    render(<ColorField label="Cor" value="#6366f1" onChange={vi.fn()} />);

    expect(screen.getByLabelText("Cor")).toHaveAttribute("type", "color");
  });

  it("mostra o código da cor ao lado da amostra", () => {
    // A amostra sozinha não diz qual cor foi escolhida.
    render(<ColorField label="Cor" value="#6366f1" onChange={vi.fn()} />);

    expect(screen.getByText("#6366f1")).toBeInTheDocument();
  });

  it("avisa quem chamou ao trocar a cor", () => {
    const onChange = vi.fn();

    render(<ColorField label="Cor" value="#6366f1" onChange={onChange} />);

    // O seletor nativo não abre no jsdom, então a troca é disparada direto.
    fireEvent.change(screen.getByLabelText("Cor"), { target: { value: "#aabbcc" } });

    expect(onChange).toHaveBeenCalledWith("#aabbcc");
  });

  it("usa a mesma moldura dos outros campos", () => {
    const { container } = render(<ColorField label="Cor" value="#6366f1" onChange={vi.fn()} />);

    // É a moldura que dá a altura comum a todos os controles.
    expect(container.querySelector(".field-control.color-control")).toBeInTheDocument();
  });

  it("anuncia o erro de validação", () => {
    render(
      <ColorField label="Cor" value="#6366f1" onChange={vi.fn()} error="use uma cor válida" />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("use uma cor válida");
    expect(screen.getByLabelText("Cor")).toHaveAttribute("aria-invalid", "true");
  });
});
