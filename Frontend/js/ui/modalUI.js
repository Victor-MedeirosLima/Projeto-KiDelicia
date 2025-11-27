// --- arquivo: js/ui/modalUI.js ---
/*
  modalUI.js
  - exporta funções para abrir e fechar o modal com dados do produto
  - adiciona showDetails(item) para compatibilidade com menuUI.js
  - dispara evento 'modal:addToCart' quando o usuário clica em "Adicionar ao pedido"
*/

const modalRoot = document.getElementById('modal');
const modalContentRoot = document.getElementById('modal-content');

function criarModalEstrutura() {
  // se já existe o conteúdo, não recria
  if (!modalContentRoot) return;
  if (modalContentRoot.innerHTML.trim() !== "") return;

  modalContentRoot.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" id="modal-close-btn" aria-label="Fechar">Fechar</button>

      <div class="modal-media">
        <img id="modal-img" src="" alt="imagem do produto">
      </div>

      <div class="modal-body">
        <h3 id="modal-name"></h3>
        <p id="modal-desc"></p>
        <p id="modal-price"></p>

        <label class="modal-qty-label">Quantidade:
          <input id="modal-qty" type="number" min="1" value="1">
        </label>

        <div class="modal-actions">
          <button id="modal-add-btn" class="btn btn-danger">Adicionar ao pedido</button>
        </div>
      </div>
    </div>
  `;

  // event listeners
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  modalRoot.addEventListener('click', (ev) => {
    // fechar ao clicar fora do conteúdo
    if (ev.target === modalRoot) closeModal();
  });
}

function openModal({ id, name, description, price, image }) {
  if (!modalRoot || !modalContentRoot) return;
  criarModalEstrutura();

  // preencher campos
  const img = document.getElementById('modal-img');
  const nm = document.getElementById('modal-name');
  const desc = document.getElementById('modal-desc');
  const priceEl = document.getElementById('modal-price');
  const qty = document.getElementById('modal-qty');

  img.src = image || '';
  img.alt = name || 'produto';
  nm.innerText = name || '';
  desc.innerText = description || '';
  priceEl.innerText = `Preço: R$ ${Number(price).toFixed(2)}`;
  qty.value = 1;

  // abrir modal (tira classe hidden)
  modalRoot.classList.remove('hidden');
  modalRoot.setAttribute('aria-hidden', 'false');

  // remover listeners antigos e adicionar novo listener
  const addBtn = document.getElementById('modal-add-btn');
  if (!addBtn) return;
  // clonar para remover todos listeners antigos (simples)
  const newBtn = addBtn.cloneNode(true);
  addBtn.parentNode.replaceChild(newBtn, addBtn);

  newBtn.addEventListener('click', () => {
    const quantidade = Number(document.getElementById('modal-qty').value) || 1;
    // dispara um evento customizado para o app capturar e adicionar ao carrinho
    const ev = new CustomEvent('modal:addToCart', {
      detail: {
        product: { id, name, description, price, image },
        quantity: quantidade
      }
    });
    window.dispatchEvent(ev);
    closeModal();
  });
}

function closeModal() {
  if (!modalRoot) return;
  modalRoot.classList.add('hidden');
  modalRoot.setAttribute('aria-hidden', 'true');
}

/*
  Compatibilidade: menuUI.js chama showDetails(item).
  Esta função faz a normalização mínima dos campos do "item"
  (pois seu renderMenu mapeia alguns campos como shortDesc, image, etc).
*/
function showDetails(item) {
  if (!item) return;
  // Alguns nomes possíveis vindo do back/front: shortDesc vs description, image vs urlImagem
  const normalized = {
    id: item.id ?? item._id ?? 0,
    name: item.name ?? item.nome ?? item.titulo ?? "Produto",
    description: item.description ?? item.shortDesc ?? item.descricao ?? "",
    price: item.price ?? item.preco ?? 0,
    image: item.image ?? item.urlImagem ?? item.img ?? "img/default.png"
  };
  openModal(normalized);
}

// exporta ambos para compatibilidade (openModal usado internamente ou por outros módulos)
export { openModal, closeModal, showDetails };
