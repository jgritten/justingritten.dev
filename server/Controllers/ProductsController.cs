using Api.DTOs;
using Api.Interfaces;
using Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;

    public ProductsController(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
        var products = await _productRepository.GetAllAsync();
        return Ok(products.Select(MapToDto));
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetActive()
    {
        var products = await _productRepository.GetActiveAsync();
        return Ok(products.Select(MapToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return NotFound(new { message = $"Product with id {id} not found" });

        return Ok(MapToDto(product));
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetByCategory(string category)
    {
        var products = await _productRepository.GetByCategoryAsync(category);
        return Ok(products.Select(MapToDto));
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { message = "Search term is required" });

        var products = await _productRepository.SearchAsync(q);
        return Ok(products.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            Category = dto.Category,
            ImageUrl = dto.ImageUrl,
            IsActive = true
        };

        var created = await _productRepository.CreateAsync(product);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToDto(created));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] UpdateProductDto dto)
    {
        var existing = await _productRepository.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { message = $"Product with id {id} not found" });

        var product = new Product
        {
            Name = dto.Name ?? existing.Name,
            Description = dto.Description ?? existing.Description,
            Price = dto.Price ?? existing.Price,
            StockQuantity = dto.StockQuantity ?? existing.StockQuantity,
            Category = dto.Category ?? existing.Category,
            ImageUrl = dto.ImageUrl ?? existing.ImageUrl,
            IsActive = dto.IsActive ?? existing.IsActive
        };

        var updated = await _productRepository.UpdateAsync(id, product);
        return Ok(MapToDto(updated!));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _productRepository.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Product with id {id} not found" });

        return NoContent();
    }

    private static ProductDto MapToDto(Product product) => new(
        product.Id,
        product.Name,
        product.Description,
        product.Price,
        product.StockQuantity,
        product.Category,
        product.ImageUrl,
        product.IsActive
    );
}
