type IconName =
  | "painel"
  | "lancamentos"
  | "fixos"
  | "categorias"
  | "dividas"
  | "cartoes"
  | "recolher"
  | "expandir"
  | "excluir"
  | "editar";

const paths: Record<IconName, string[]> = {
  painel: ["M3 3h7v7H3z", "M14 3h7v5h-7z", "M14 12h7v9h-7z", "M3 14h7v7H3z"],
  lancamentos: ["M4 6h16", "M4 12h16", "M4 18h10"],
  fixos: ["M17 2l4 4-4 4", "M3 11V9a4 4 0 0 1 4-4h14", "M7 22l-4-4 4-4", "M21 13v2a4 4 0 0 1-4 4H3"],
  categorias: ["M3 3h8l10 10-8 8L3 11V3z", "M7.5 7.5h.01"],
  // Ponteiro de medidor: a dívida se mede pelo quanto já andou.
  dividas: ["M3.5 18a9 9 0 1 1 17 0", "M12 18l4.5-5.5"],
  cartoes: ["M2 7h20v12H2z", "M2 11h20", "M6 15h4"],
  excluir: ["M4 7h16", "M9 7V5h6v2", "M6 7l1 13h10l1-13", "M10 11v6", "M14 11v6"],
  editar: ["M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z", "M14.5 6.5l3 3"],
  recolher: ["M15 18l-6-6 6-6"],
  expandir: ["M9 18l6-6-6-6"],
};

/** Ícones de traço, no mesmo peso do resto da interface. */
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export type { IconName };
