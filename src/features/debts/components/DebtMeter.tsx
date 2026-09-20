import { formatMoney } from "../../../lib/money";
import type { DebtProgress } from "../types";

/**
 * O medidor de quitação. Uma série só: o preenchimento carrega o quanto já
 * venceu, e o trilho é o mesmo tom mais claro, para o estado ser lido ao
 * longo da barra inteira. Os números ficam ao lado, nunca só na cor.
 *
 * É um <progress> de verdade em vez de duas divs: leitor de tela anuncia o
 * valor sem precisar de ARIA à mão.
 */
export function DebtMeter({ progress }: { progress: DebtProgress }) {
  return (
    <div className={`debt-meter${progress.settled ? " is-settled" : ""}`}>
      <div className="debt-meter-head">
        <span className="debt-meter-count">
          {progress.paid_count} de {progress.paid_count + progress.remaining_count} parcelas
        </span>
        <span className="debt-meter-percent">{progress.percent}%</span>
      </div>

      <progress
        className="debt-meter-bar"
        value={progress.paid_cents}
        max={progress.total_cents}
        aria-label={`${progress.percent}% da dívida já venceu`}
      />

      <div className="debt-meter-foot">
        <span>
          {formatMoney(progress.paid_cents)} de {formatMoney(progress.total_cents)}
        </span>
        <span className="debt-meter-remaining">
          {progress.settled ? "Quitada" : `Faltam ${formatMoney(progress.remaining_cents)}`}
        </span>
      </div>
    </div>
  );
}
