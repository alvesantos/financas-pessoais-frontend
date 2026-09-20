import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

/**
 * O jsdom não implementa os métodos do <dialog>. O polyfill mexe no atributo
 * open, senão o conteúdo do modal fica inacessível às buscas por papel.
 */
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}

// Cada teste começa sem sessão salva: o estado de um não vaza para o outro.
beforeEach(() => {
  localStorage.clear();
});
