import { createOrder, createCustomer } from '../api.js';
import { getCart, getTotal, clearCart } from '../cart.js';
import { refreshCartIndicator } from './uiHelpers.js';

export function renderCheckoutForm(panel) {
  panel.innerHTML = `
    <h3>Finalizar Pedido</h3>
    <form id="checkout-form">
      <label>Nome: <input name="customer" required /></label>
      <label>Mesa / Referência: <input name="table" required type="number" /></label>
      <label>Observações: <textarea name="notes"></textarea></label>
      <p><strong>Total: R$ ${getTotal().toFixed(2)}</strong></p>
      <button type="submit" class="btn primary">Confirmar Pedido</button>
      <button type="button" id="btn-back" class="btn ghost">Voltar</button>
    </form>
  `;

  document.getElementById('btn-back').addEventListener('click', () => window.location.reload());

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
      //Criar cliente no banco
      const novoCliente = await createCustomer({
        nome: form.customer.value,
        mesa: Number(form.table.value),
      });

      const clienteId = novoCliente?.id;
      if (!clienteId) {
        throw new Error("Erro ao criar cliente! Backend não retornou ID.");
      }

      //Criar pedido com o ID do cliente
      const cartItems = getCart().items;

      const payload = {
        clienteId: clienteId,
        itens: cartItems.map(item => ({
          produtoId: Number(item.id),
          quantidade: item.qty
        }))
      };

      const resp = await createOrder(payload);

      //Interface de confirmação
      panel.innerHTML = `
        <h3>Pedido Enviado!</h3>
        <p>Número do pedido: <strong>${resp?.id || 'SIM-' + Date.now()}</strong></p>
        <p>Obrigado, ${form.customer.value}!</p>
      `;

      clearCart();
      refreshCartIndicator();

    } catch (err) {
      console.error(err);
      panel.innerHTML = `
        <h3>Erro ao enviar pedido 😢</h3>
        <p>${err.message}</p>
      `;
    }
  });
}
