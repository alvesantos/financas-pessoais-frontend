import { useEffect } from "react";
import { Select } from "../../../components/ui/Select";
import type { Kind } from "../../../types/finance";
import { useCategories } from "../hooks/useCategories";

/** Valor do campo quando nenhuma categoria foi escolhida. */
const SEM_CATEGORIA = "";

interface CategorySelectProps {
  /** Só aparecem as categorias deste tipo. */
  kind: Kind;
  value: number | null;
  error?: string;
  onChange: (categoryId: number | null) => void;
}

/**
 * Escolha de categoria, restrita ao tipo do lançamento: o backend recusa uma
 * categoria de outro tipo, então nem faz sentido oferecê-la.
 */
export function CategorySelect({ kind, value, error, onChange }: CategorySelectProps) {
  const { categories } = useCategories();

  const doTipo = categories.filter((category) => category.kind === kind);

  // Trocar o tipo do lançamento pode invalidar a categoria escolhida.
  useEffect(() => {
    if (value !== null && !doTipo.some((category) => category.id === value)) {
      onChange(null);
    }
  }, [doTipo, value, onChange]);

  const options = [
    { value: SEM_CATEGORIA, label: "Sem categoria" },
    ...doTipo.map((category) => ({ value: String(category.id), label: category.name })),
  ];

  return (
    <Select
      label="Categoria"
      value={value === null ? SEM_CATEGORIA : String(value)}
      options={options}
      onChange={(selected) => onChange(selected === SEM_CATEGORIA ? null : Number(selected))}
      error={error}
    />
  );
}
