import { monthName } from "../../../lib/dates";

interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrevious: () => void;
  onNext: () => void;
}

/** Navegação entre os meses, que é como a tela é separada por mês e ano. */
export function MonthNavigator({ year, month, onPrevious, onNext }: MonthNavigatorProps) {
  return (
    <div className="month-nav">
      <button type="button" className="month-nav-button" onClick={onPrevious} aria-label="Mês anterior">
        ‹
      </button>

      <h1 className="month-nav-label">
        {monthName(month)} <span>{year}</span>
      </h1>

      <button type="button" className="month-nav-button" onClick={onNext} aria-label="Próximo mês">
        ›
      </button>
    </div>
  );
}
