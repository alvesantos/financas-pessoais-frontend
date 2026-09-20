import { formatMoney } from "../../../lib/money";
import type { KindTotal } from "../types";

/**
 * Onde o dinheiro foi no mês, do maior para o menor.
 *
 * Uma série só: a cor não carrega identidade — o rótulo carrega —, então não
 * há legenda e cada barra traz o valor direto ao lado.
 */
export function ExpenseByKindChart({ data }: { data: KindTotal[] }) {
  if (data.length === 0) {
    return <p className="chart-empty">Nenhum gasto neste mês.</p>;
  }

  const maior = Math.max(...data.map((item) => item.total_cents));
  const total = data.reduce((sum, item) => sum + item.total_cents, 0);

  return (
    <ul className="ranked-bars">
      {data.map((item) => {
        const share = Math.round((item.total_cents / total) * 100);

        return (
          <li key={item.kind} className="ranked-bar" title={`${share}% dos gastos do mês`}>
            <div className="ranked-bar-head">
              <span className="ranked-bar-label">{item.label}</span>
              <span className="ranked-bar-value">{formatMoney(item.total_cents)}</span>
            </div>

            <div className="ranked-bar-track">
              <div
                className="ranked-bar-fill"
                style={{ width: `${Math.max((item.total_cents / maior) * 100, 2)}%` }}
              />
            </div>

            <span className="ranked-bar-share">{share}% dos gastos</span>
          </li>
        );
      })}
    </ul>
  );
}
