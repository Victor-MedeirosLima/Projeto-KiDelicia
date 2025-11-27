// main.js
import { renderMenu } from './ui/menuUI.js';
import { renderCartPanel } from './ui/cartUI.js';
import { refreshCartIndicator } from './ui/uiHelpers.js';
import { closeModal } from './ui/modalUI.js';
import { renderOrders } from './order.js';
import { addToCart } from './cart.js'; // <-- import para adicionar itens vindo do modal

// inicialização
const routes = {
  menu: async () => { 
    await renderMenu(); 
    attachCart(); 
  },
  pedidos: async () => {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>Pedidos</h2><div id="orders-placeholder">Carregando...</div>';
    const ph = document.getElementById('orders-placeholder');
    await renderOrders(ph);
    attachCart();
  },
  admin: () => {
    window.location.href = 'login.html';
  }
};

function attachCart() {
  // cria painel do carrinho caso não exista
  let panel = document.getElementById('cart-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'cart-panel';
    document.body.appendChild(panel);
  }
  renderCartPanel(panel);
  refreshCartIndicator();
}

// -------------------------
// Novo: ouve evento vindo do modal quando o usuário clicar "Adicionar ao pedido"
// Este evento é disparado em modalUI.js como 'modal:addToCart' com detail { product, quantity }
window.addEventListener('modal:addToCart', (ev) => {
  try {
    const { product, quantity } = ev.detail || {};
    if (!product) {
      console.warn('modal:addToCart recebido sem product', ev.detail);
      return;
    }

    // Usa a mesma função de adicionar que o resto do app usa
    addToCart(product, Number(quantity) || 1);

    // Atualiza visual do painel e indicador
    refreshCartIndicator();
    // re-renderiza o painel caso já esteja aberto
    const panel = document.getElementById('cart-panel');
    if (panel) renderCartPanel(panel);

    // feedback visual simples (opcional)
    // você pode disparar um toast ou animação aqui
    console.log(`Produto adicionado (do modal): ${product.name} x ${quantity}`);
  } catch (err) {
    console.error('Erro ao processar modal:addToCart', err);
  }
});
// -------------------------

// navegação
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const route = e.target.dataset.route;
    if (routes[route]) {
      await routes[route]();
    } else {
      console.error(`Rota ${route} não encontrada`);
    }
  });
});

// modal close ao clicar fora
const modal = document.getElementById('modal');
if (modal) {
  modal.addEventListener('click', (ev) => {
    if (ev.target === ev.currentTarget) closeModal();
  });
}

// inicia na rota menu
routes.menu();
