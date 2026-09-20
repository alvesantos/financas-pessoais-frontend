import { formatMoney } from "../../../lib/money";
import type { CategoryTotal } from "../types";

/**
 * Onde o dinheiro foi no mês, por categoria, do maior para o menor.
 *
 * Uma série só: o comprimento da barra carrega a grandeza e o rótulo carrega
 * a identidade, então não há legenda. A cor da categoria aparece como um
 * ponto ao lado do nome, e não como a cor da barra: cores escolhidas pela
 * pessoa não passam por validação de contraste nem de daltonismo, e usá-las
 * na barra faria a leitura depender delas.
 */
export function ExpenseByCategoryChart({ data }: { data: CategoryTotal[] }) {
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
          <li key={item.category_id ?? "sem-categoria"} className="ranked-bar">
            <div className="ranked-bar-head">
              <span className="ranked-bar-label">
                <span
                  className="category-dot"
                  style={{ background: item.color }}
                  aria-hidden="true"
                />
                {item.label}
              </span>
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
