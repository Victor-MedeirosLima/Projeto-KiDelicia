const STORAGE_KEY = 'kidelicia_cart_v1';

let cart = { items: [] };

// carregar do localStorage
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) cart = JSON.parse(raw);
  } catch (e) {
    cart = { items: [] };
  }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
load();

// adicionar item 
export function addToCart(product, qty = 1) {
  const id = String(product.id); // garante string
  const found = cart.items.find(i => i.id === id);
  if (found) {
    found.qty += qty;
  } else {
    cart.items.push({
      id,
      name: product.name,
      price: Number(product.price) || 0,
      qty
    });
  }
  save();
  return cart;
}

// remover item por ID
export function removeFromCart(id) {
  cart.items = cart.items.filter(i => i.id !== String(id));
  save();
  return cart;
}

// atualizar quantidade
export function updateQty(id, qty) {
  id = String(id);
  const it = cart.items.find(i => i.id === id);
  if (!it) return cart;
  it.qty = Math.max(0, Number(qty));
  if (it.qty === 0) cart.items = cart.items.filter(i => i.id !== id);
  save();
  return cart;
}

export function clearCart() {
  cart.items = [];
  save();
  return cart;
}

export function getCart() {
  return JSON.parse(JSON.stringify(cart));
}

export function getTotal() {
  return cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getCount() {
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}
