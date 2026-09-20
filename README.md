# Finn — Web

Interface em React + TypeScript do **Finn — Finanças Pessoais**. Organização
por **feature**: cada domínio da aplicação guarda suas próprias páginas,
componentes, chamadas de API e tipos.

Design minimalista: paleta neutra, um único tom de destaque, tema claro e
escuro seguindo o sistema.

## Stack

| Item | Escolha |
|---|---|
| Build | Vite |
| UI | React 19 + TypeScript |
| Rotas | React Router |
| Estilo | CSS com custom properties (sem framework) |
| Lint | oxlint |

## Rodando

```bash
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

A API precisa estar no ar em `VITE_API_URL` (padrão `http://localhost:8080/api`).

## Comandos

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # typecheck + build de produção em dist/
npm run preview   # serve o build
npm run lint      # oxlint
npm test          # testes unitários (Vitest)
npm run test:watch
npm run test:coverage
npm run test:e2e  # testes e2e (Playwright)
```

## Estrutura

```
src/
  app/                    composição da aplicação
    App.tsx               raiz
    AppProviders.tsx      router + providers empilhados
    AppRoutes.tsx         mapa de rotas públicas e privadas
  routes/                 guardas de rota
    paths.ts              as rotas em um só lugar
    ProtectedRoute.tsx    exige sessão válida
    PublicRoute.tsx       só para visitantes
  features/               um diretório por domínio
    auth/
      api/auth.api.ts     as rotas de autenticação da API
      components/         AuthForm
      context/            AuthProvider e o contexto da sessão
      hooks/useAuth.ts    acesso ao contexto
      pages/LoginPage     tela de entrada (+ CSS ao lado)
      types.ts            tipos do domínio de autenticação
    dashboard/
      pages/DashboardPage
  components/             reutilizáveis, sem regra de negócio
    ui/                   Button, TextField, Logo, Alert
    layout/AppHeader
  lib/                    infraestrutura
    http-client.ts        único ponto que conhece a URL base e o token
    api-error.ts          ApiError normalizado, com erros por campo
    token-storage.ts      localStorage com try/catch
  styles/
    index.css             ponto de entrada
    tokens.css            variáveis de design (claro e escuro)
    reset.css             reset e base
    components.css        estilos dos componentes de ui/
```

Por que assim: uma feature nova (contas, lançamentos) entra como uma pasta
em `features/`, sem tocar nas outras. O que é genérico fica em `components/`
e `lib/`; o que é de um domínio fica com ele.

## Camadas

```
página → componente → hook → api da feature → httpClient → API Go
```

Nenhum componente chama `fetch` direto. O `httpClient` concentra a URL base,
o cabeçalho `Authorization` e a conversão de falha em `ApiError`; a camada
`features/*/api` traduz isso nas rotas daquele domínio.

## Testes

**Unitários** (Vitest + Testing Library), ao lado do arquivo testado. Testam
o que o usuário vê, não o estado interno; só a camada `features/*/api` é
mockada. `src/test/render.tsx` renderiza com o router e o `AuthProvider`
reais.

```bash
npm test
```

**E2e** (Playwright), em `e2e/`. Rodam contra a aplicação e a API de verdade.
O Vite sobe sozinho; a API precisa estar no ar antes:

```bash
cd ../backend && make db-up && make run   # em outro terminal
npm run test:e2e
```

Na primeira vez, instale o navegador e as bibliotecas do sistema:

```bash
npx playwright install chromium
sudo npx playwright install-deps chromium
```

Cobrem cadastro, login, erro por campo, erro geral, persistência da sessão
ao recarregar, redirecionamento de visitante e logout.

## Erros

`ApiError` espelha o formato do backend. Erros por campo vão para o input
correspondente; o resto vira uma mensagem única acima do botão:

```ts
catch (error) {
  if (error instanceof ApiError) {
    setFieldErrors(error.fields);
    if (!error.hasFieldErrors) setFormError(error.message);
  }
}
```

## Autenticação

O token JWT fica no `localStorage`. Ao abrir a aplicação, o `AuthProvider`
valida o token salvo em `GET /auth/me` antes de liberar as rotas privadas;
se a validação falhar, o token é descartado. `ProtectedRoute` guarda a rota
de origem e devolve o usuário a ela depois do login.

## Design

Os tokens ficam em `src/styles/tokens.css`, no `:root`, e são redefinidos em
`prefers-color-scheme: dark`. Para mudar a identidade visual, troque
`--accent`, `--accent-hover`, `--accent-soft` e `--accent-contrast` — nada
mais depende da cor.

Acessibilidade: labels associadas por `htmlFor`, erros anunciados com
`role="alert"` e `aria-describedby`, foco sempre visível, e as animações
respeitam `prefers-reduced-motion`.
