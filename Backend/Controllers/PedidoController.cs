
using Backend.Dtos;
using Backend.Models;
using Backend.Models.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;

[ApiController]
[Route("[controller]")]
public class PedidoController : ControllerBase
{
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IProdutoRepository _produtoRepository;

    public PedidoController(IPedidoRepository pedidoRepository, IClienteRepository clienteRepository, IProdutoRepository produtoRepository)
    {
        _pedidoRepository = pedidoRepository;
        _clienteRepository = clienteRepository;
        _produtoRepository = produtoRepository;
    }

    
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAllPedidos()
    {

        var pedidos = await _pedidoRepository.GetAllPedidos();

        if (pedidos is null)
        {

            return NotFound(new { erro = "Nenhum pedido encontrado." });
        }
        var resposta = pedidos.Select(p => new
        {
            id = p.Id,
            total = p.ValorTotal,
            status = p.Status.ToString(),
            date = p.DataHora,
            customer = p.Cliente?.Nome ?? "Cliente",
            table = p.Cliente?.Mesa,
            items = p.Itens.Select(i => new
            {
                qty = i.Quantidade,
                name = i.Produto?.Nome,
                price = i.PrecoUnitario
            })
        });

        return Ok(resposta);

    }

    
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetPedidoById(int id)
    {

        var p = await _pedidoRepository.GetPedidoById(id);

        if (p is null)
        {

            return NotFound(new { erro = "Pedido não encontrado." });
        }
        
        var pedido = new
        {
            id = p.Id,
            total = p.ValorTotal,
            status = p.Status.ToString(),
            date = p.DataHora,
            customer = p.Cliente?.Nome ?? "Cliente",
            table = p.Cliente?.Mesa,
            items = p.Itens.Select(i => new
            {
                qty = i.Quantidade,
                name = i.Produto?.Nome,
                price = i.PrecoUnitario
            })
        };

        return Ok(pedido);

    }


    [HttpPost]
public async Task<IActionResult> CreatePedido([FromBody] PedidoCreateDto dto)
{
    try
    {
        var cliente = await _clienteRepository.GetClienteById(dto.ClienteId);
        if (cliente == null)
            return BadRequest(new { erro = $"Cliente com ID {dto.ClienteId} não encontrado." });

        var pedido = new Pedido
        {
            ClienteId = dto.ClienteId,
            DataHora = DateTime.UtcNow,
            Status = PedidoStatus.Recebido
        };

        await _pedidoRepository.AddPedido(pedido);
        

        decimal total = 0;
        var itens = new List<Itens>();

        
        foreach (var itemDto in dto.Itens)
        {
            var produto = await _produtoRepository.GetProdutoById(itemDto.ProdutoId);
            if (produto == null)
                return BadRequest(new { erro = $"Produto com ID {itemDto.ProdutoId} não encontrado." });

            var item = new Itens
            {
                PedidoId = pedido.Id,
                ProdutoId = produto.Id,
                Quantidade = itemDto.Quantidade,
                PrecoUnitario = produto.Preco
            };

            total += produto.Preco * itemDto.Quantidade;
            itens.Add(item);
        }

        
        pedido.Itens = itens;
        pedido.ValorTotal = total;

        await _pedidoRepository.UpdatePedido(pedido);

        return CreatedAtAction(nameof(GetPedidoById), new { id = pedido.Id }, pedido);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { erro = $"Erro interno ao criar o pedido: {ex.InnerException?.Message ?? ex.Message}" });
    }
}


    
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdatePedido(int id, [FromBody] PedidoUpdateDto update)
    {
        if (id != update.Id)
        {
            return BadRequest(new { erro = "O ID informado não corresponde ao pedido enviado." });
        }

        var pedidoExistente = await _pedidoRepository.GetPedidoById(id);
        if (pedidoExistente is null)
        {
            return NotFound(new { erro = "Produto não encontrado para atualização." });
        }

        try
        {
            
            pedidoExistente.Status = update.Status;           
           


            await _pedidoRepository.UpdatePedido(pedidoExistente);
            return Ok(new { menssagem = "Pedido atualizado com sucesso." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { erro = $"Erro ao atualizar o pedido: {ex.Message}" });
        }
    }

    
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeletePedido(int id)
    {
        var pedidoExistente = await _pedidoRepository.GetPedidoById(id);
        if (pedidoExistente is null)
        {
            return NotFound(new { erro = "Pedido não encontrado para exclusão." });
        }

        try
        {
            await _pedidoRepository.DeletePedido(id);
            return Ok(new { menssagem = "Pedido deletado com sucesso." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { erro = $"Erro ao excluir o pedido: {ex.Message}" });
        }
    }
}
