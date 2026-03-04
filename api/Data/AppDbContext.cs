using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.IsActive);
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = 1,
                Name = "Wireless Bluetooth Headphones",
                Description = "Premium noise-cancelling headphones with 30-hour battery life",
                Price = 149.99m,
                StockQuantity = 50,
                Category = "Electronics",
                ImageUrl = "https://example.com/images/headphones.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 15, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 2,
                Name = "Ergonomic Office Chair",
                Description = "Adjustable lumbar support with breathable mesh back",
                Price = 299.99m,
                StockQuantity = 25,
                Category = "Furniture",
                ImageUrl = "https://example.com/images/chair.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 16, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 3,
                Name = "Stainless Steel Water Bottle",
                Description = "Double-walled insulated bottle, keeps drinks cold for 24 hours",
                Price = 34.99m,
                StockQuantity = 100,
                Category = "Kitchen",
                ImageUrl = "https://example.com/images/bottle.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 17, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 4,
                Name = "Mechanical Gaming Keyboard",
                Description = "RGB backlit with Cherry MX switches",
                Price = 129.99m,
                StockQuantity = 75,
                Category = "Electronics",
                ImageUrl = "https://example.com/images/keyboard.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 18, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 5,
                Name = "Yoga Mat Premium",
                Description = "Extra thick non-slip exercise mat with carrying strap",
                Price = 45.99m,
                StockQuantity = 60,
                Category = "Sports",
                ImageUrl = "https://example.com/images/yogamat.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 19, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 6,
                Name = "Smart Watch Pro",
                Description = "Fitness tracking, heart rate monitor, GPS enabled",
                Price = 249.99m,
                StockQuantity = 40,
                Category = "Electronics",
                ImageUrl = "https://example.com/images/smartwatch.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 20, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 7,
                Name = "Standing Desk Converter",
                Description = "Adjustable height desk riser for improved ergonomics",
                Price = 179.99m,
                StockQuantity = 30,
                Category = "Furniture",
                ImageUrl = "https://example.com/images/deskconverter.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 21, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 8,
                Name = "Portable Phone Charger",
                Description = "20000mAh power bank with fast charging support",
                Price = 49.99m,
                StockQuantity = 150,
                Category = "Electronics",
                ImageUrl = "https://example.com/images/powerbank.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 22, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 9,
                Name = "Coffee Maker Deluxe",
                Description = "12-cup programmable coffee maker with thermal carafe",
                Price = 89.99m,
                StockQuantity = 45,
                Category = "Kitchen",
                ImageUrl = "https://example.com/images/coffeemaker.jpg",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 23, 10, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 10,
                Name = "Resistance Bands Set",
                Description = "5 different resistance levels for home workouts",
                Price = 24.99m,
                StockQuantity = 200,
                Category = "Sports",
                ImageUrl = "https://example.com/images/resistancebands.jpg",
                IsActive = false,
                CreatedAt = new DateTime(2026, 1, 24, 10, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
