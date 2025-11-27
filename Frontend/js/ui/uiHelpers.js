// uiHelpers.js
// Funções pequenas e reutilizáveis de interface.

import { getCount } from '../cart.js';

export function refreshCartIndicator() {
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = getCount();
  } else {
    console.warn('Elemento #cart-count não encontrado no DOM.');
  }
}

