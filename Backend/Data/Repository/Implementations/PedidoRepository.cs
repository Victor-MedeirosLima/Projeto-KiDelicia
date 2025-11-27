

using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

public class PedidoRepository: IPedidoRepository
{
    private readonly AplicacaoContext _context;

    public PedidoRepository(AplicacaoContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Pedido>> GetAllPedidos()
    {
        return await _context.Pedidos.
                        Include(p=>p.Cliente)
                        .Include(p=>p.Itens)
                        .ThenInclude(p=>p.Produto)
                        .OrderByDescending(p=> p.DataHora)
                        .ToListAsync();
    }

    public async Task<Pedido?> GetPedidoById(int id)
    {
        return await _context.Pedidos.
                        Include(p=>p.Cliente)
                        .Include(p=>p.Itens)
                        .ThenInclude(p=>p.Produto)
                        .FirstOrDefaultAsync(p=> p.Id == id);
    }

    public async Task AddPedido(Pedido pedido)
{
    await _context.Pedidos.AddAsync(pedido);
    await _context.SaveChangesAsync();
}


    public async Task UpdatePedido(Pedido pedido)
    {
        _context.Pedidos.Update(pedido);
        await _context.SaveChangesAsync();
    }

    public async Task DeletePedido(int id)
    {
        var pedido = await _context.Pedidos.FindAsync(id);
        if (pedido != null)
        {
            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();
        }
    }
}
