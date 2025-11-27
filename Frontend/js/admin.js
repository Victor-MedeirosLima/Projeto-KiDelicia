import { fetchOrders, updateOrderStatus } from "./api.js";
import { setupAdminMenu } from "./ui/adminMenu.js";

// Collapse produtos
const collapseTitle = document.getElementById("toggle-produtos");
const collapseContent = document.getElementById("produtos-collapse");

collapseTitle.addEventListener("click", () => {
    collapseContent.classList.toggle("open");
    collapseTitle.classList.toggle("active");
});


setupAdminMenu(); // mantém seus produtos funcionando

// -----------------------------
//  PEDIDOS
// -----------------------------

const tabela = document.querySelector("#tabela-pedidos tbody");
const filtroStatus = document.getElementById("filtro-status");
const notificacao = document.getElementById("notificacao");

let ultimoPedidoId = null;

async function carregarPedidos() {
    const pedidos = await fetchOrders();
    renderTabela(pedidos);
    detectarNovosPedidos(pedidos);
}

function renderTabela(pedidos) {
    tabela.innerHTML = "";

    const filtro = filtroStatus.value;

    pedidos
        .filter(p => filtro === "todos" || p.status === filtro)
        .forEach(p => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>${p.id}</td>
                <td>${formatarData(p.date)}</td>
                <td>${p.customer} (Mesa ${p.table})</td>
                <td>${formatarItens(p.items)}</td>
                <td>R$ ${p.total.toFixed(2)}</td>
                <td>
                    <select class="status-select" data-id="${p.id}">
                        ${renderStatusOptions(p.status)}
                    </select>
                </td>
                <td>
                    <button class="btn-update" data-id="${p.id}">Atualizar</button>
                </td>
            `;

            tabela.appendChild(linha);
        });

    ativarBotoesStatus();
}

function renderStatusOptions(statusAtual) {
    const STATUS = ["Recebido","EmPreparo","Pronto","Entregue"];

    return STATUS.map(s => `
        <option value="${s}" ${s === statusAtual ? "selected" : ""}>
            ${formatarStatus(s)}
        </option>
    `).join("");
}

function formatarStatus(s) {
    return s.replace("EmPreparo", "Em preparo");
}

function formatarData(dt) {
    return new Date(dt).toLocaleString("pt-BR");
}

function formatarItens(lista) {
    if (!lista) return "";

    return lista.map(i => `${i.qty}x ${i.name}`).join("<br>");
}

// 🔔 Detecção de novos pedidos
function detectarNovosPedidos(listaPedidos) {
    if (!listaPedidos.length) return;

    const maiorId = Math.max(...listaPedidos.map(p => p.id));

    if (ultimoPedidoId === null) {
        ultimoPedidoId = maiorId;
        return;
    }

    if (maiorId > ultimoPedidoId) {
        ultimoPedidoId = maiorId;
        mostrarNotificacao();
    }
}

function mostrarNotificacao() {
    notificacao.style.display = "block";

    setTimeout(() => {
        notificacao.style.display = "none";
    }, 4000);
}

// Atualiza status
function ativarBotoesStatus() {
    document.querySelectorAll(".btn-update").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const novoStatus = document.querySelector(
                `.status-select[data-id="${id}"]`
            ).value;

            try {
                await updateOrderStatus(id, novoStatus);
                alert("Status atualizado!");

                carregarPedidos(); // recarrega tabela
            } catch (err) {
                alert("Erro ao atualizar status");
                console.error(err);
            }
        });
    });
}

// Atualizar automaticamente a cada 4 segundos
setInterval(carregarPedidos, 4000);

// Carregar ao abrir
carregarPedidos();

// Filtro
filtroStatus.addEventListener("change", carregarPedidos);
// tenta ligar o collapse assim que os elementos existirem (polling)
(function initCollapseWhenReady() {
  const tryAttach = () => {
    const title = document.getElementById("toggle-produtos");
    const content = document.getElementById("produtos-collapse");
    if (!title || !content) return false;

    // remove polling
    clearInterval(intervalId);

    // estado inicial fechado
    content.classList.remove("open");
    title.classList.remove("active");

    title.addEventListener("click", () => {
      content.classList.toggle("open");
      title.classList.toggle("active");
    });
    return true;
  };

  // checar a cada 200ms por até 5s
  const intervalId = setInterval(() => {
    if (tryAttach()) {
      // anexado com sucesso
    }
  }, 200);

  // opcional: timeout para parar de tentar
  setTimeout(() => clearInterval(intervalId), 5000);
})();
