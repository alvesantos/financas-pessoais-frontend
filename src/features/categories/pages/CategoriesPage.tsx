import { useCallback, useEffect, useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { IconButton } from "../../../components/ui/IconButton";
import { categoriesApi } from "../api/categories.api";
import { CategoryForm } from "../components/CategoryForm";
import type { Category } from "../types";
import "./CategoriesPage.css";

export function CategoriesPage() {
  // A versão carregada é comparada com a pedida para derivar o carregamento,
  // em vez de um setState no começo do efeito.
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<{ version: number; categories: Category[] }>({
    version: -1,
    categories: [],
  });
  const [error, setError] = useState("");

  const loading = loaded.version !== version;
  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    categoriesApi
      .list(controller.signal)
      .then((categories) => setLoaded({ version, categories }))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;

        setError("Não foi possível carregar as categorias.");
        setLoaded({ version, categories: [] });
      });

    return () => controller.abort();
  }, [version]);

  async function handleDelete(category: Category) {
    setError("");

    try {
      await categoriesApi.remove(category.id);
      reload();
    } catch {
      setError("Não foi possível apagar a categoria.");
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Categorias</h1>
        <p>Agrupe os lançamentos do mesmo assunto. O nome é único dentro de cada tipo.</p>
      </header>

      <Card title="Nova categoria">
        <CategoryForm onCreated={reload} />
      </Card>

      <Card title="Suas categorias">
        {error && <Alert>{error}</Alert>}

        {loading ? (
          <p className="loading-note">Carregando…</p>
        ) : loaded.categories.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria cadastrada"
            hint="Crie as que fizerem sentido para você: mercado, transporte, moradia."
          />
        ) : (
          <ul className="entries">
            {loaded.categories.map((category) => (
              <li key={category.id} className="entry">
                <span
                  className="category-dot"
                  style={{ background: category.color }}
                  aria-hidden="true"
                />

                <span className="entry-body">
                  <span className="entry-description">{category.name}</span>
                  <span className="entry-meta">{category.kind_label}</span>
                </span>

                <IconButton
                  icon="excluir"
                  label={`Apagar ${category.name}`}
                  danger
                  onClick={() => handleDelete(category)}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
