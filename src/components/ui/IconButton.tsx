import { Icon, type IconName } from "./Icon";

interface IconButtonProps {
  icon: IconName;
  label: string;
  /** Marca a ação como destrutiva, que é o que a pinta de vermelho. */
  danger?: boolean;
  onClick: () => void;
}

/** Ação compacta de uma linha de lista. */
export function IconButton({ icon, label, danger = false, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-button${danger ? " is-danger" : ""}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}
