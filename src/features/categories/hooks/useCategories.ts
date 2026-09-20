import { useEffect, useState } from "react";
import { categoriesApi } from "../api/categories.api";
import type { Category } from "../types";

/**
 * Carrega as categorias do usuário. A lista é curta e muda pouco, então cada
 * formulário busca a sua: não vale um cache compartilhado por enquanto.
 */
export function useCategories(): { categories: Category[]; loading: boolean } {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    categoriesApi
      .list(controller.signal)
      .then((listed) => {
        setCategories(listed);
        setLoaded(true);
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        // Sem categorias o formulário ainda funciona: o campo fica só com
        // "Sem categoria".
        setLoaded(true);
      });

    return () => controller.abort();
  }, []);

  return { categories, loading: !loaded };
}
