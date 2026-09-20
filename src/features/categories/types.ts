import type { Kind } from "../../types/finance";

/** Uma categoria agrupa lançamentos de um mesmo tipo. */
export interface Category {
  id: number;
  name: string;
  kind: Kind;
  kind_label: string;
  color: string;
}

export interface CreateCategoryInput {
  name: string;
  kind: Kind;
  color: string;
}
