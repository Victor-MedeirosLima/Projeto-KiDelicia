import { fetchMenu } from '../api.js';
import { addToCart } from '../cart.js';
import { refreshCartIndicator } from './uiHelpers.js';
import { showDetails } from './modalUI.js';

export async function renderMenu() {
  const app = document.getElementById('app');
  app.innerHTML = '<h2>Cardápio</h2><div id="categories"></div><div id="menu" class="menu-grid"></div>';
  const menuEl = document.getElementById('menu');
  
  let items = await fetchMenu().catch(() => []); // Trata erros de fetch

  //Normalizar dados do backend → formato do front  
  items = (items || []).map(p => ({
    id: p.id ?? 0,
    name: p.nome?.trim() || "Produto sem nome",
    shortDesc: p.descricao?.trim() || "Descrição indisponível",
    price: Number(p.preco) || 0,
    category: p.categoriaProduto?.trim() || "Sem Categoria",
    image: p.urlImagem?.trim() || "img/default.png"
  }));

  // Categorias 
  const cats = {};
  items.forEach(it => {
    cats[it.category] = cats[it.category] || [];
    cats[it.category].push(it);
  });

  const categoriesDiv = document.getElementById('categories');
  categoriesDiv.innerHTML = Object.keys(cats)
    .map(c => `<button class="btn ghost cat-btn" data-cat="${c}">${c}</button>`)
    .join(' ');

  function showCategory(cat) {
    menuEl.innerHTML = '';
    cats[cat].forEach(item => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <h3>${item.name}</h3>
        <p class="small">${item.shortDesc}</p>
        <div class="meta"><div class="price">R$ ${(item.price).toFixed(2)}</div></div>
        <div class="actions">
          <button class="btn ghost btn-details" data-id="${item.id}">Detalhes</button>
          <button class="btn primary btn-add" data-id="${item.id}">Adicionar</button>
        </div>`;
      menuEl.appendChild(el);
    });
  }

  // Eventos
  categoriesDiv.addEventListener('click', ev => {
    const btn = ev.target.closest('.cat-btn');
    if (!btn) return;
    document.querySelectorAll('.cat-btn').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    showCategory(btn.dataset.cat);
  });

  menuEl.addEventListener('click', ev => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const item = items.find(x => x.id === id);

    if (!item) return alert('Item não encontrado.');

    if (btn.classList.contains('btn-add')) {
      addToCart(item);
      refreshCartIndicator();
      btn.textContent = 'Adicionado ✓';
      setTimeout(() => (btn.textContent = 'Adicionar'), 700);
    } else if (btn.classList.contains('btn-details')) {
      showDetails(item);
    }
  });

  // Exibe primeira categoria automaticamente
  const first = Object.keys(cats)[0];
  if (first) {
    document.querySelector(`.cat-btn[data-cat="${first}"]`)?.classList.add('active');
    showCategory(first);
  } else {
    menuEl.innerHTML = '<p>Nenhum item disponível no momento.</p>';
  }

  refreshCartIndicator();
}
