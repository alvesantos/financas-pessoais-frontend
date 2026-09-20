import { useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { formatMoney } from "../../../lib/money";
import { debtsApi } from "../api/debts.api";
import type { Debt } from "../types";

interface SettleDialogProps {
  debt: Debt | null;
  onDone: () => void;
  onClose: () => void;
}

/**
 * Quitação em dois passos. O primeiro confirma que a dívida acabou; o
 * segundo pergunta se o que faltava deve sair do saldo em carteira, que é
 * uma decisão separada: quem já lançou o pagamento à mão não quer o desconto
 * em dobro.
 */
export function SettleDialog({ debt, onDone, onClose }: SettleDialogProps) {
  const [step, setStep] = useState<"confirmar" | "saldo">("confirmar");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!debt) return null;

  async function settle(subtractFromBalance: boolean) {
    setError("");
    setSubmitting(true);

    try {
      await debtsApi.settle(debt!.id, subtractFromBalance);
      onDone();
    } catch {
      setError("Não foi possível quitar a dívida.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "confirmar") {
    return (
      <Dialog open title="Quitar dívida" onClose={onClose}>
        <p className="dialog-note">
          A dívida <strong>{debt.description}</strong> foi quitada? Ainda constam{" "}
          {formatMoney(debt.progress.remaining_cents)} em aberto, e as parcelas somem dos
          lançamentos.
        </p>

        {error && <Alert>{error}</Alert>}

        <div className="dialog-actions">
          <Button type="button" onClick={() => setStep("saldo")}>
            Sim, foi quitada
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Não
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open title="Descontar do saldo?" onClose={onClose}>
      <p className="dialog-note">
        Quer subtrair {formatMoney(debt.progress.remaining_cents)} do seu saldo em carteira? Isso
        cria um lançamento já pago com esse valor. Se você já lançou o pagamento à mão, responda
        não.
      </p>

      {error && <Alert>{error}</Alert>}

      <div className="dialog-actions">
        <Button type="button" loading={submitting} onClick={() => settle(true)}>
          Sim, descontar
        </Button>
        <Button type="button" variant="ghost" onClick={() => settle(false)}>
          Não, só quitar
        </Button>
      </div>
    </Dialog>
  );
}
