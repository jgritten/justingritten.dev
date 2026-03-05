using Api.Models;

namespace Api.Interfaces;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<IEnumerable<Product>> GetActiveAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetByCategoryAsync(string category);
    Task<IEnumerable<Product>> SearchAsync(string searchTerm);
    Task<Product> CreateAsync(Product product);
    Task<Product?> UpdateAsync(int id, Product product);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
