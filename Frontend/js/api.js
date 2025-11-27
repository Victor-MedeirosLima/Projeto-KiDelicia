import { getToken } from './auth.js';
const API_BASE = 'http://localhost:5073'; // ajuste conforme necessário

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);

    // Se a resposta não tiver conteúdo (204 No Content), retorna null em vez de tentar res.json()
    if (res.status === 204) return null;

    // tenta extrair texto para mensagens de erro em CORS ou HTML
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
    }

    // Tenta parsear JSON, mas se não for JSON retorna null
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    } else {
      return null;
    }
  } catch (err) {
    console.error('Erro em safeFetch:', err);
    throw err;
  }
}

//menu: GET /produto
export async function fetchMenu() {
  try {
    return await safeFetch(`${API_BASE}/produto`);
  } catch (err) {
    // fallback para arquivo local de amostra (útil para desenvolvimento)
    try {
      return await safeFetch('/data/sample-menu.json');
    } catch {
      return [];
    }
  }
}

export async function createCustomer(payload) {
  return await safeFetch(`${API_BASE}/cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

//pedidos: POST /pedido
export async function createOrder(orderPayload) {
  try {
    // envia o payload exatamente como o backend .NET espera (cliente + itens)
    return await safeFetch(`${API_BASE}/pedido`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(orderPayload)
    });
  } catch (err) {
    // fallback local em dev: retorna um id sintético com a mesma chave "id" usada pelo frontend
    console.warn('createOrder fallback:', err);
    return { id: `SIM-${Date.now()}`, success: true };
  }
}

//listar pedidos do admin: GET /pedido
export async function fetchOrders() {
  try {
    const token = getToken();
    return await safeFetch(`${API_BASE}/pedido`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  } catch (err) {
    console.warn("Erro ao buscar pedidos, retornando lista vazia.", err);
    return [];
  }
}

// login: POST /administrador/login
export async function loginRequest(email, password) {
  return await safeFetch(`${API_BASE}/administrador/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha: password })
  });
}

// CRUD de produto
export async function createMenuItem(payload, token) {
  return await safeFetch(`${API_BASE}/produto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function updateMenuItem(id, payload, token) {
  return await safeFetch(`${API_BASE}/produto/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteMenuItem(id, token) {
  return await safeFetch(`${API_BASE}/produto/${id}`, {
    method: 'DELETE',
    headers: {'Authorization': `Bearer ${token}`}
  });
}

// atualizar status do pedido (admin)
export async function updateOrderStatus(id, newStatus) {
  const token = getToken();

  // exige token (admin)
  if (!token) {
    throw new Error('Token de administrador não encontrado. Faça login antes de alterar o status.');
  }

  return await safeFetch(`${API_BASE}/pedido/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: Number(id),
      status: newStatus
    })
  });
}
