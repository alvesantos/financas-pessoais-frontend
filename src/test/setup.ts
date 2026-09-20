import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Cada teste começa sem sessão salva: o estado de um não vaza para o outro.
beforeEach(() => {
  localStorage.clear();
});
