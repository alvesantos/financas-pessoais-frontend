import { useEffect, useState } from "react";
import { cardsApi } from "../api/cards.api";
import type { CreditCard } from "../types";

/** Carrega os cartões do usuário. A lista é curta e muda pouco. */
export function useCards(): { cards: CreditCard[]; loading: boolean } {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    cardsApi
      .list(controller.signal)
      .then((listed) => {
        setCards(listed);
        setLoaded(true);
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        // Sem cartões o formulário ainda funciona.
        setLoaded(true);
      });

    return () => controller.abort();
  }, []);

  return { cards, loading: !loaded };
}
