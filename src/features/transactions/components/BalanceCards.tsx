import { formatMoney } from "../../../lib/money";
import type { MonthSummary } from "../types";

/** Uma métrica do mês. O saldo ganha cor conforme o sinal. */
function Balance({ label, cents, hint, signed = false }: {
  label: string;
  cents: number;
  hint: string;
  signed?: boolean;
}) {
  const tone = signed ? (cents < 0 ? " is-negative" : " is-positive") : "";

  return (
    <div className="balance">
      <p className="balance-label">{label}</p>
      <p className={`balance-value${tone}`}>{formatMoney(cents)}</p>
      <p className="balance-hint">{hint}</p>
    </div>
  );
}

export function BalanceCards({ summary }: { summary: MonthSummary | null }) {
  const empty = { saldo_atual_cents: 0, saldo_previsto_cents: 0, receitas_cents: 0, despesas_cents: 0 };
  const data = summary ?? empty;

  return (
    <div className="balance-grid">
      <Balance
        label="Saldo atual"
        cents={data.saldo_atual_cents}
        hint="O que já entrou e saiu até hoje"
        signed
      />
      <Balance
        label="Saldo previsto"
        cents={data.saldo_previsto_cents}
        hint="O mês fechado, com os fixos"
        signed
      />
      <Balance label="Receitas" cents={data.receitas_cents} hint="Tudo que soma no mês" />
      <Balance label="Despesas" cents={data.despesas_cents} hint="Tudo que subtrai no mês" />
    </div>
  );
}
