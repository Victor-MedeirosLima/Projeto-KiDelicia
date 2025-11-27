console.log("adminMenu.js carregado!");

import { createMenuItem, fetchMenu, updateMenuItem, deleteMenuItem } from "../api.js";
import { getToken } from "../auth.js";
import { requireAdminAuth } from "./requireAdmin.js";

export function setupAdminMenu() {

  if (!requireAdminAuth()) return;

  const btnNew = document.getElementById('btn-new-item');
  const listContainer = document.getElementById('items-list');

  // ----------------- CRIAR PRODUTO -----------------
  btnNew.addEventListener('click', async () => {
    const nome = prompt("Nome do produto:");
    const descricao = prompt("Descrição:");
    const preco = prompt("Preço (ex: 9.99):");
    const categoriaProduto = prompt("Categoria do produto:");
    const urlImagem = prompt("URL da imagem:");

    if (!nome || !descricao || !preco || !categoriaProduto) {
      alert("Todos os campos obrigatórios devem ser preenchidos!");
      return;
    }

    try {
      await createMenuItem(
        {
          nome,
          descricao,
          preco: parseFloat(preco),
          categoriaProduto,
          urlImagem
        },
        getToken()
      );

      alert("Item criado com sucesso!");
      loadMenuItems(listContainer);

    } catch (err) {
      alert("Erro ao criar item: " + err.message);
    }
  });

  // carrega lista inicial
  loadMenuItems(listContainer);
}

// ----------------------------------------------------------------------

async function loadMenuItems(container) {
  container.innerHTML = "Carregando...";
  const menu = await fetchMenu();
  const token = getToken();

  container.innerHTML = menu.map(item => `
    <div class="admin-item" data-id="${item.id}" 
         style="padding:10px;border-bottom:1px solid #ccc">

      <strong>${item.nome}</strong> - R$ ${item.preco.toFixed(2)}
      <br>
      <em>${item.descricao}</em>
      <br>
      Categoria: ${item.categoriaProduto}
      <br><br>

      <!-- Botões -->
      <button class="btn-edit" data-id="${item.id}">
        Atualizar
      </button>

      <button class="btn-delete" data-id="${item.id}" 
              style="margin-left:10px;color:white">
        Excluir
      </button>

    </div>
  `).join("");

  // ----------------- ATUALIZAR PRODUTO -----------------
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;
      const atual = menu.find(x => x.id == id);

      const nome = prompt("Novo nome:", atual.nome);
      const descricao = prompt("Nova descrição:", atual.descricao);
      const preco = prompt("Novo preço:", atual.preco);
      const categoriaProduto = prompt("Nova categoria:", atual.categoriaProduto);
      const urlImagem = prompt("Nova URL da imagem:", atual.urlImagem);

      if (!nome || !descricao || !preco || !categoriaProduto) {
        alert("Todos os campos obrigatórios devem ser preenchidos!");
        return;
      }

      try {
        await updateMenuItem(
  id,
  {
    id: Number(id), // obrigatório para o backend validar
    nome,
    descricao,
    preco: parseFloat(preco),
    categoriaProduto,
    urlImagem
  },
  token
);

        alert("Item atualizado!");
        loadMenuItems(container);

      } catch (err) {
        alert("Erro ao atualizar item: " + err.message);
      }
    });
  });

  // ----------------- EXCLUIR PRODUTO -----------------
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;

      if (!confirm("Tem certeza que deseja excluir este item?")) return;

      try {
        await deleteMenuItem(id, token);
        alert("Item excluído!");
        loadMenuItems(container);

      } catch (err) {
        alert("Erro ao excluir item: " + err.message);
      }
    });
  });
}
