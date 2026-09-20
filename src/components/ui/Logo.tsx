import { useTheme } from "../../features/theme/hooks/useTheme";

/**
 * Marca do Mnemio. O arquivo escuro é um ladrilho azul-marinho com o
 * monograma claro, e o claro é o inverso — por isso o escuro vai no tema
 * claro, e vice-versa: é o que mantém o contraste com o fundo.
 */
export function Logo({ size = 34 }: { size?: number }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? "/mnemio-icon-light.webp" : "/mnemio-icon-dark.webp";

  return (
    <img
      className="logo"
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  );
}
