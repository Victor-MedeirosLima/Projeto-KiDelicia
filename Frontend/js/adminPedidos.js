import { fetchOrders, updateOrderStatus } from "../api.js";
import { getToken } from "../auth.js";
import { requireAdminAuth } from "./requireAdmin.js";

export function setupAdminPedidos() {

    if (!requireAdminAuth()) return;

    const tabela = document.querySelector("#tabela-pedidos tbody");
    const filtro = document.querySelector("#filtro-status");

    // BOTÃO PARA RECARREGAR A LISTA MANUALMENTE
    const btnReload = document.createElement("button");
    btnReload.textContent = "Recarregar pedidos";
    btnReload.style.marginBottom = "10px";
    tabela.parentElement.parentElement.prepend(btnReload);

    btnReload.addEventListener("click", carregarPedidos);

    filtro.addEventListener("change", carregarPedidos);

    carregarPedidos();

    async function carregarPedidos() {
        tabela.innerHTML = "<tr><td colspan='6'>Carregando...</td></tr>";

        const token = getToken();
        if (!token) {
            tabela.innerHTML = "<tr><td colspan='6'>Token inválido</td></tr>";
            return;
        }

        const pedidos = await fetchOrders();

        if (!pedidos || pedidos.length === 0) {
            tabela.innerHTML = "<tr><td colspan='6'>Nenhum pedido encontrado</td></tr>";
            return;
        }

        const filtroValor = filtro.value;

        const pedidosFiltrados = pedidos.filter(p => {
            if (filtroValor === "todos") return true;
            return p.status === filtroValor;
        });

        tabela.innerHTML = pedidosFiltrados.map(p => {
            const itensHtml = p.itens
                .map(i => `${i.quantidade}x ${i.nome}`)
                .join("<br>");

            return `
                <tr>
                    <td>${p.id}</td>
                    <td>${new Date(p.dataHora).toLocaleString()}</td>
                    <td>${p.clienteNome} (Mesa ${p.mesa})</td>
                    <td>${itensHtml}</td>
                    <td>R$ ${p.valorTotal.toFixed(2)}</td>
                    <td>
                        <select data-id="${p.id}" class="status-select">
                            <option value="Recebido" ${p.status === "Recebido" ? "selected" : ""}>Recebido</option>
                            <option value="EmPreparo" ${p.status === "EmPreparo" ? "selected" : ""}>Em Preparo</option>
                            <option value="Pronto" ${p.status === "Pronto" ? "selected" : ""}>Pronto</option>
                            <option value="Entregue" ${p.status === "Entregue" ? "selected" : ""}>Entregue</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join("");

        // EVENTO PARA ALTERAR STATUS
        document.querySelectorAll(".status-select").forEach(sel => {
            sel.addEventListener("change", async () => {
                const id = sel.dataset.id;
                const novoStatus = sel.value;

                try {
                    await updateOrderStatus(id, novoStatus);
                    alert("Status atualizado!");
                } catch (err) {
                    alert("Erro ao atualizar status: " + err.message);
                }
            });
        });
    }
}
