/** Rotas da aplicação em um só lugar: nenhum literal espalhado pelo código. */
export const paths = {
  login: "/login",
  dashboard: "/",
  transactions: "/lancamentos",
  recurring: "/fixos",
  categories: "/categorias",
  debts: "/dividas",
} as const;
