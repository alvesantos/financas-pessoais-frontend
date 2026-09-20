# Finn — Web (React + TypeScript)

Interface do Finn — Finanças Pessoais. Organização por feature, design
minimalista.

## Regras obrigatórias

### Commits

- **Nunca se adicione como co-autor.** Não inclua `Co-Authored-By: Claude`
  nem nenhuma outra linha de atribuição a assistente.
- Também não adicione "Generated with Claude Code" em descrições de PR.
- Mensagem no formato `tipo: descrição` (`feat`, `fix`, `refactor`, `test`,
  `chore`, `docs`), em português, no imperativo.
- O corpo explica **por quê**, não o que o diff já mostra.

### Testes

Toda funcionalidade entra com **testes unitários e testes e2e**. Não
considere uma funcionalidade pronta sem os dois.

- **Unitários**: componentes e hooks com Vitest + Testing Library, testando
  o comportamento que o usuário vê — não o estado interno. A camada `api/`
  da feature é mockada.
- **E2e**: Playwright, contra a aplicação rodando e a API de verdade.
  Cubra o fluxo completo da funcionalidade e os caminhos de erro.
- Cubra sempre: caminho feliz, erro de validação por campo, erro geral do
  formulário e o estado de carregamento.
- Unitários ficam ao lado do arquivo testado (`AuthForm.test.tsx`); e2e ficam
  em `e2e/`. Use `src/test/render.tsx` para renderizar com os providers reais.
- Os testes e2e precisam da API no ar (`cd ../backend && make db-up && make run`).
- Rode `npm test`, `npm run lint` e `npm run build` antes de commitar. Não
  commite com teste vermelho.

## Comandos

```bash
npm run dev       # :5173
npm run build     # typecheck + build
npm run preview   # serve o build
npm run lint      # oxlint
npm test          # unitários (Vitest)
npm run test:watch
npm run test:coverage
npm run test:e2e  # Playwright — exige a API no ar
```

## Estrutura

```
src/
  app/          App, AppProviders, AppRoutes
  routes/       paths.ts, ProtectedRoute, PublicRoute
  features/     um diretório por domínio
    auth/       api/ components/ context/ hooks/ pages/ types.ts
    dashboard/
  components/   ui/ (Button, TextField, Logo, Alert) e layout/
  lib/          httpClient, ApiError, tokenStorage
  styles/       index, tokens, reset, components
```

Regras que não se quebram:

- **Feature nova é pasta nova em `features/`**, sem tocar nas outras.
- O que é genérico vai para `components/` e `lib/`; o que é de um domínio
  fica com ele.
- **Nenhum componente chama `fetch` direto.** Toda chamada passa por
  `features/<feature>/api/*.api.ts`, que usa o `httpClient`.
- Rotas só em `routes/paths.ts`. Nada de string de rota espalhada.
- `localStorage` sempre dentro de try/catch — em aba anônima ele lança.

## Convenções

- Código, comentários, textos de interface e commits em **português**.
- Comentário explica o porquê de uma decisão, não o que a linha faz.
- Erros de API viram `ApiError`: `error.fields` vai para o input
  correspondente, o resto vira mensagem única do formulário.
- **Cores só por token** de `styles/tokens.css`. Nunca hex solto no
  componente. Todo token novo precisa do par claro/escuro.
- **Dinheiro sempre em centavos**, como inteiro. Formatar e interpretar só
  por `lib/money.ts` — nunca `toFixed` espalhado pelos componentes.
- **Datas ISO são fatiadas como texto** (`lib/dates.ts`), não passadas por
  `new Date`: `new Date("2026-09-20")` vira dia 19 em fusos a oeste.
- **Gráfico novo passa pela skill `dataviz` antes de ser escrito.** Duas ou
  mais séries exigem legenda e uma tabela com os mesmos números; uma série só
  dispensa a legenda e usa rótulo direto. Par de cores novo precisa ser
  validado para daltonismo nas duas superfícies antes de entrar.
- Estilo de página fica ao lado da página; estilo de componente de `ui/`
  fica em `styles/components.css`.
- Acessibilidade não é opcional: label com `htmlFor`, erro com
  `role="alert"` e `aria-describedby`, foco visível, animação respeitando
  `prefers-reduced-motion`.
- `.env` nunca é versionado; mudanças vão para `.env.example`.
