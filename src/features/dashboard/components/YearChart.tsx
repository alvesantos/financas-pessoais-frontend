import { useState } from "react";
import { monthNameShort } from "../../../lib/dates";
import { formatMoney } from "../../../lib/money";
import type { MonthTotals } from "../types";

const WIDTH = 720;
const HEIGHT = 230;
const PADDING = { top: 16, right: 12, bottom: 28, left: 56 };

const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

/** Caminho de uma barra com só as pontas de cima arredondadas. */
function barPath(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, height, width / 2);
  const bottom = y + height;

  return [
    `M ${x} ${bottom}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${bottom}`,
    "Z",
  ].join(" ");
}

/** Escala "bonita" para o topo do eixo, em vez do máximo cru. */
function niceCeiling(value: number): number {
  if (value <= 0) return 100;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

interface YearChartProps {
  data: MonthTotals[];
  year: number;
}

/**
 * Receitas e despesas de cada mês do ano, em barras agrupadas.
 *
 * Duas séries, então a legenda é obrigatória: a identidade nunca fica só na
 * cor. O par de cores é o mesmo nos temas claro e escuro porque foi validado
 * nas duas superfícies, inclusive para daltonismo.
 */
export function YearChart({ data, year }: YearChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((m) => Math.max(m.receitas_cents, m.despesas_cents)), 0);
  const ceiling = niceCeiling(maxValue);

  const groupWidth = PLOT_WIDTH / data.length;
  const barWidth = Math.min(11, groupWidth / 2 - 2);
  const scale = (cents: number) => (cents / ceiling) * PLOT_HEIGHT;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const active = hovered === null ? null : data[hovered];

  if (maxValue === 0) {
    return (
      <p className="chart-empty">Sem movimentação em {year}. Os lançamentos do ano aparecem aqui.</p>
    );
  }

  return (
    <figure className="chart">
      <figcaption className="chart-legend">
        <span className="chart-legend-item">
          <span className="chart-swatch" style={{ background: "var(--chart-receita)" }} />
          Receitas
        </span>
        <span className="chart-legend-item">
          <span className="chart-swatch" style={{ background: "var(--chart-despesa)" }} />
          Despesas
        </span>
      </figcaption>

      <div className="chart-plot">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Receitas e despesas de ${year}`}>
          {gridLines.map((ratio) => {
            const y = PADDING.top + PLOT_HEIGHT - ratio * PLOT_HEIGHT;

            return (
              <g key={ratio}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  stroke="var(--chart-grid)"
                  strokeWidth={1}
                />
                <text x={PADDING.left - 8} y={y + 4} textAnchor="end" className="chart-tick">
                  {Math.round((ceiling * ratio) / 100).toLocaleString("pt-BR")}
                </text>
              </g>
            );
          })}

          {data.map((month, index) => {
            const groupX = PADDING.left + index * groupWidth;
            const baseline = PADDING.top + PLOT_HEIGHT;
            // 2px de folga entre as duas barras do mesmo mês.
            const receitaX = groupX + groupWidth / 2 - barWidth - 1;
            const despesaX = groupX + groupWidth / 2 + 1;

            return (
              <g
                key={month.month}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Alvo de hover maior que as barras, para o ponteiro pegar fácil. */}
                <rect
                  x={groupX}
                  y={PADDING.top}
                  width={groupWidth}
                  height={PLOT_HEIGHT}
                  fill={hovered === index ? "var(--surface-muted)" : "transparent"}
                />

                {/* O atraso por mês faz a série desenhar da esquerda para a
                    direita, na ordem em que se lê o eixo. */}
                <g className="bar-grow" style={{ animationDelay: `${index * 0.03}s` }}>
                  <path
                    d={barPath(receitaX, baseline - scale(month.receitas_cents), barWidth, scale(month.receitas_cents), 4)}
                    fill="var(--chart-receita)"
                  />
                  <path
                    d={barPath(despesaX, baseline - scale(month.despesas_cents), barWidth, scale(month.despesas_cents), 4)}
                    fill="var(--chart-despesa)"
                  />
                </g>

                <text
                  x={groupX + groupWidth / 2}
                  y={HEIGHT - 10}
                  textAnchor="middle"
                  className="chart-tick"
                >
                  {monthNameShort(month.month)}
                </text>
              </g>
            );
          })}
        </svg>

        {active && (
          <div className="chart-tooltip" role="status">
            <strong>{monthNameShort(active.month)}</strong>
            <span>
              <span className="chart-swatch" style={{ background: "var(--chart-receita)" }} />
              {formatMoney(active.receitas_cents)}
            </span>
            <span>
              <span className="chart-swatch" style={{ background: "var(--chart-despesa)" }} />
              {formatMoney(active.despesas_cents)}
            </span>
          </div>
        )}
      </div>

      {/* Mesma informação em tabela, para quem não lê o gráfico. */}
      <details className="chart-table">
        <summary>Ver os números</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Mês</th>
              <th scope="col">Receitas</th>
              <th scope="col">Despesas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((month) => (
              <tr key={month.month}>
                <th scope="row">{monthNameShort(month.month)}</th>
                <td>{formatMoney(month.receitas_cents)}</td>
                <td>{formatMoney(month.despesas_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
