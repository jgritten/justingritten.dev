using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
        public DbSet<VisitMetric> VisitMetrics => Set<VisitMetric>();
        public DbSet<TenantClient> TenantClients => Set<TenantClient>();
        public DbSet<TenantMembership> TenantMemberships => Set<TenantMembership>();
        public DbSet<TenantInvitation> TenantInvitations => Set<TenantInvitation>();
        public DbSet<TenantUserPreference> TenantUserPreferences => Set<TenantUserPreference>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TenantClient>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.CreatedAtUtc);
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasData(
                    new TenantClient
                    {
                        Id = NorthwindsDemoTenant.ClientId,
                        Name = NorthwindsDemoTenant.DisplayName,
                        CreatedAtUtc = new DateTime(2026, 4, 2, 12, 0, 0, DateTimeKind.Utc),
                        IsDeleted = false,
                    });
            });

            modelBuilder.Entity<TenantMembership>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ClerkUserId).IsRequired().HasMaxLength(128);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(64);
                entity.Property(e => e.MemberEmail).HasMaxLength(320);
                entity.Property(e => e.CreatedAtUtc);
                entity.HasIndex(e => e.ClerkUserId);
                entity.HasIndex(e => new { e.ClerkUserId, e.TenantClientId }).IsUnique();
                // SQLite: at most one Owner membership per tenant (strict product rule).
                entity.HasIndex(e => e.TenantClientId)
                    .IsUnique()
                    .HasDatabaseName("IX_TenantMemberships_OneOwnerPerClient")
                    .HasFilter($"\"Role\" = '{TenantRoles.Owner}'");
                entity.HasOne(e => e.TenantClient)
                    .WithMany()
                    .HasForeignKey(e => e.TenantClientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TenantInvitation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.InviteeEmail).IsRequired().HasMaxLength(320);
                entity.Property(e => e.InviteeEmailNormalized).IsRequired().HasMaxLength(254);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(64);
                entity.Property(e => e.Status).HasConversion<int>();
                entity.Property(e => e.CreatedAtUtc);
                entity.HasIndex(e => new { e.InviteeEmailNormalized, e.Status });
                // At most one pending invite per (tenant, email) — avoids duplicate demo invites under concurrency.
                entity.HasIndex(e => new { e.TenantClientId, e.InviteeEmailNormalized })
                    .IsUnique()
                    .HasDatabaseName("IX_TenantInvitations_Pending_UniqueTenantEmail")
                    .HasFilter($"\"Status\" = {(int)InvitationStatus.Pending}");
                entity.HasOne(e => e.TenantClient)
                    .WithMany()
                    .HasForeignKey(e => e.TenantClientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TenantUserPreference>(entity =>
            {
                entity.HasKey(e => e.ClerkUserId);
                entity.Property(e => e.ClerkUserId).HasMaxLength(128);
                entity.Property(e => e.SkipHubWhenDefaultAvailable).HasDefaultValue(false);
            });

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

            modelBuilder.Entity<ContactMessage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(254);
                entity.Property(e => e.CompanyOrProject).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Message).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.Source).HasMaxLength(100);
                entity.Property(e => e.CreatedAt);
            });

            modelBuilder.Entity<VisitMetric>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Route).IsRequired().HasMaxLength(200);
                entity.Property(e => e.OccurredAtUtc);
                entity.Property(e => e.Count);
                entity.HasIndex(e => e.OccurredAtUtc);
                entity.HasIndex(e => new { e.Route, e.OccurredAtUtc });
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
