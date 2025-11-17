
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


[ApiController]
[Route("[controller]")]
public class ProdutoController : ControllerBase
{

    private readonly IProdutoRepository _produtoRepository;

    public ProdutoController(IProdutoRepository produtoRepository)
    {
        _produtoRepository = produtoRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProdutos()
    {

        var produtos = await _produtoRepository.GetAllProdutos();

        if (produtos is null)
        {

            return NotFound(new { erro = "Nenhum produto encontrado." });
        }
        else
        {

            return Ok(produtos);
        }

    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetProdutoById(int id)
    {

        var produto = await _produtoRepository.GetProdutoById(id);

        if (produto is null)
        {

            return NotFound(new { erro = "Produto não encontrado." });
        }
        else
        {

            return Ok(produto);
        }

    }


    
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateProduto([FromBody] Produto produto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _produtoRepository.AddProduto(produto);
            return CreatedAtAction(nameof(GetProdutoById), new { id = produto.Id }, produto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { erro = $"Erro ao criar o produto: {ex.Message}" });
        }
    }


    
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProduto(int id, [FromBody] Produto produto)
    {
        if (id != produto.Id)
        {
            return BadRequest(new { erro = "O ID informado não corresponde ao produto enviado." });
        }

        var produtoExistente = await _produtoRepository.GetProdutoById(id);
        if (produtoExistente is null)
        {
            return NotFound(new { erro = "Produto não encontrado para atualização." });
        }

        try
        {   

            produtoExistente.Nome = produto.Nome;
            produtoExistente.Descricao = produto.Descricao;
            produtoExistente.CategoriaProduto = produto.CategoriaProduto;
            produtoExistente.Preco = produto.Preco;
            produtoExistente.UrlImagem = produto.UrlImagem;


            await _produtoRepository.UpdateProduto(produtoExistente);
            return Ok(new { menssagem = "Produto atualizado com sucesso." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { erro = $"Erro ao atualizar o produto: {ex.Message}" });
        }
    }

    
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProduto(int id)
    {
        var produtoExistente = await _produtoRepository.GetProdutoById(id);
        if (produtoExistente is null)
        {
            return NotFound(new { erro = "Produto não encontrado para exclusão." });
        }

        try
        {
            await _produtoRepository.DeleteProduto(id);
            return Ok(new { menssagem = "Produto excluído com sucesso." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { erro = $"Erro ao excluir o produto: {ex.Message}" });
        }
    }



}