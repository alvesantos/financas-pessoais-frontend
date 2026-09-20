import { Icon, type IconName } from "./Icon";

interface IconButtonProps {
  icon: IconName;
  label: string;
  /** Marca a ação como destrutiva, que é o que a pinta de vermelho. */
  danger?: boolean;
  /** Marca a ação como confirmação, que é o que a pinta no tom de destaque. */
  confirm?: boolean;
  onClick: () => void;
}

/** Ação compacta de uma linha de lista. */
export function IconButton({
  icon,
  label,
  danger = false,
  confirm = false,
  onClick,
}: IconButtonProps) {
  const tone = danger ? " is-danger" : confirm ? " is-confirm" : "";

  return (
    <button
      type="button"
      className={`icon-button${tone}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}
