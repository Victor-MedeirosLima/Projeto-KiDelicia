// cartUI.js
import { getCart, updateQty, removeFromCart, clearCart, getTotal } from '../cart.js';
import { renderCheckoutForm } from './checkoutUI.js';
import { refreshCartIndicator } from './uiHelpers.js';

export function renderCartPanel(container = null) {
  let panel = container;
  if (!panel) {
    panel = document.getElementById('cart-panel');
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'cart-panel';
      panel.className = 'cart-panel';
      document.body.appendChild(panel);
    }
  }

  const cart = getCart();
  if (!cart || cart.items.length === 0) {
    panel.innerHTML = `<h3>Seu pedido</h3><p class="small">Carrinho vazio</p>`;
    return;
  }

  panel.innerHTML = `
    <h3>Seu pedido</h3>
    ${cart.items.map(it => `
      <div class="cart-item" data-id="${it.id}">
        <div style="flex:1">
          <strong>${it.name}</strong>
          <div class="small">R$ ${Number(it.price).toFixed(2)} × ${it.qty}</div>
        </div>
        <div class="qty-control">
          <button class="btn ghost btn-decrease" data-id="${it.id}">-</button>
          <span class="small">${it.qty}</span>
          <button class="btn ghost btn-increase" data-id="${it.id}">+</button>
          <button class="btn ghost btn-remove" data-id="${it.id}">🗑</button>
        </div>
      </div>
    `).join('')}
    <div style="margin-top:10px">
      <strong>Total: R$ ${getTotal().toFixed(2)}</strong><br>
      <button id="btn-checkout" class="btn primary">Finalizar Pedido</button>
      <button id="btn-clear" class="btn ghost">Limpar</button>
    </div>
  `;

  // Eventos de quantidade
  panel.querySelectorAll('.btn-increase').forEach(b =>
    b.addEventListener('click', e => {
      const id = String(e.target.dataset.id);
      updateQty(id, (getCart().items.find(i => i.id === id)?.qty || 0) + 1);
      renderCartPanel(panel);
      refreshCartIndicator();
    })
  );

  panel.querySelectorAll('.btn-decrease').forEach(b =>
    b.addEventListener('click', e => {
      const id = String(e.target.dataset.id);
      const item = getCart().items.find(i => i.id === id);
      if (item) {
        if (item.qty > 1) {
          updateQty(id, item.qty - 1);
        } else {
          removeFromCart(id);
        }
      }
      renderCartPanel(panel);
      refreshCartIndicator();
    })
  );

  // Remover item
  panel.querySelectorAll('.btn-remove').forEach(b =>
    b.addEventListener('click', e => {
      removeFromCart(Number(e.target.dataset.id));
      renderCartPanel(panel);
      refreshCartIndicator();
    })
  );

  // Botões gerais
  document.getElementById('btn-checkout').addEventListener('click', () => renderCheckoutForm(panel));
  document.getElementById('btn-clear').addEventListener('click', () => {
    clearCart();
    renderCartPanel(panel);
    refreshCartIndicator();
  });
}
