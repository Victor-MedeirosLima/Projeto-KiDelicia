using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace KiDelicia.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteRepository _clienteRepository;

        public ClienteController(IClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllClientes()
        {
            var clientes = await _clienteRepository.GetAllClientes();

            if (clientes is null || !clientes.Any())
            {
                return NotFound(new { erro = "Nenhum cliente encontrado." });
            }

            return Ok(clientes);
        }

        
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetClienteById(int id)
        {
            var cliente = await _clienteRepository.GetClienteById(id);

            if (cliente is null)
            {
                return NotFound(new { erro = "Cliente não encontrado." });
            }

            return Ok(cliente);
        }


        
        [HttpGet("nome/{nome}")]
        [Authorize]
        public async Task<IActionResult> GetClienteByNome(string nome)
        {
            var cliente = await _clienteRepository.GetClienteByName(nome);

            if (cliente is null)
            {
                return NotFound(new { erro = "Cliente não encontrado." });
            }

            return Ok(cliente);
        }

        
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCliente([FromBody] Cliente cliente)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _clienteRepository.AddCliente(cliente);
                return CreatedAtAction(nameof(GetClienteById), new { id = cliente.Id }, cliente);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = $"Erro ao criar o cliente: {ex.Message}" });
            }
        }
    }
}
