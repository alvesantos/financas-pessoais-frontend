import { formatMoney } from "../../../lib/money";

interface StatTileProps {
  label: string;
  cents: number;
  hint?: string;
  /** Colore o número conforme o sinal — só faz sentido para saldos. */
  signed?: boolean;
}

/** Um número em destaque. Sem gráfico: um valor só não precisa de um. */
export function StatTile({ label, cents, hint, signed = false }: StatTileProps) {
  const tone = signed ? (cents < 0 ? " is-negative" : " is-positive") : "";

  return (
    <div className="stat-tile">
      <p className="stat-label">{label}</p>
      <p className={`stat-value${tone}`}>{formatMoney(cents)}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  );
}
