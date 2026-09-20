import { useEffect, useRef, type ReactNode } from "react";
import "./Dialog.css";

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

/**
 * Caixa modal em cima do <dialog> nativo: foco preso, Esc fecha e o resto da
 * página fica inerte sem nenhuma dessas coisas precisar de código próprio.
 */
export function Dialog({ open, title, children, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={ref} className="dialog" onCancel={onClose} onClose={onClose}>
      <div className="dialog-body">
        <h2 className="dialog-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
