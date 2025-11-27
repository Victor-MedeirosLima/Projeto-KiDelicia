
import { fetchOrders, updateOrderStatus } from './api.js';

let lastOrderCount = 0; // para detectar novos pedidos

export async function renderOrders(container, filterStatus = null) {
  try {
    const orders = await fetchOrders();

    // FILTRO por status
    const filtered = filterStatus
      ? orders.filter(o => (o.status || '').toLowerCase() === filterStatus.toLowerCase())
      : orders;

    if (!filtered || filtered.length === 0) {
      container.innerHTML = '<p class="small">Nenhum pedido encontrado</p>';
      return;
    }

    
    detectNewOrders(orders.length);

    container.innerHTML = filtered.map(o => `
      <div class="card" data-order-id="${o.id}">
        
        <div style="display: flex; justify-content: space-between;">
          <div>
            <strong>Pedido #${o.id}</strong>
            <div class="small">${formatDate(o.dataHora)}</div>
            <div class="small">${o.cliente?.nome || 'Cliente'} • Mesa ${o.cliente?.mesa || '?'}</div>
          </div>

          <div class="small"><strong>R$ ${Number(o.total).toFixed(2)}</strong></div>
        </div>

        <div class="small" style="margin-top:6px;">
          Status: <strong>${o.status}</strong>
        </div>

        <div style="margin-top:8px;">
          ${o.itens.map(i => `
            <div class="small">
              ${i.quantidade}x ${i.nome} — R$ ${Number(i.preco).toFixed(2)}
            </div>
          `).join('')}
        </div>

        <div style="margin-top:10px; display:flex; gap:8px;">
          ${renderStatusButton(o.id, "EmPreparo", o.status)}
          ${renderStatusButton(o.id, "Pronto", o.status)}
          ${renderStatusButton(o.id, "Entregue", o.status)}
        </div>

      </div>
    `).join('');

    // Eventos de atualização de status
    container.querySelectorAll('.btn-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const newStatus = btn.dataset.status;

        try {
          await updateOrderStatus(id, newStatus);
          renderOrders(container); // recarrega lista
        } catch (err) {
          alert("Erro ao alterar status.");
        }
      });
    });

  } catch (err) {
    console.error('Erro ao carregar pedidos:', err);
    container.innerHTML = '<p class="small">Erro ao carregar pedidos.</p>';
  }
}


// Helpers -------------------------------

// Botões de status com destaque visual
function renderStatusButton(id, status, current) {
  const active = current?.toLowerCase() === status.toLowerCase();
  return `
    <button 
      class="btn ghost btn-status ${active ? 'selected-status' : ''}"
      data-id="${id}" 
      data-status="${status}"
    >
      ${status.replace(/([A-Z])/g, ' $1')}
    </button>
  `;
}

// Formatação de data/hora
function formatDate(dt) {
  if (!dt) return 'Data indisponível';
  const d = new Date(dt);
  return d.toLocaleString('pt-BR');
}

// Notificação visual de novos pedidos
function detectNewOrders(totalOrders) {
  if (lastOrderCount === 0) {
    lastOrderCount = totalOrders;
    return;
  }

  if (totalOrders > lastOrderCount) {
    showNewOrderNotification();
  }

  lastOrderCount = totalOrders;
}

// Exibe notificação vermelha visual
function showNewOrderNotification() {
  const badge = document.getElementById("order-notification");
  if (badge) {
    badge.style.display = "block";
  }
}
