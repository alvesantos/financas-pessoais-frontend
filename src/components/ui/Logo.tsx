/** Marca do produto: um gráfico ascendente reduzido ao essencial. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="logo" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" width={size * 0.55} height={size * 0.55}>
        <path
          d="M4 16.5 9.5 11l3.5 3.5L20 7.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 7.5H20V12"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
