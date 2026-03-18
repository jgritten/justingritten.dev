using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 254, nullable: false),
                    CompanyOrProject = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Source = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Price = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    StockQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VisitMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Route = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitMetrics", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "ImageUrl", "IsActive", "Name", "Price", "StockQuantity", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Electronics", new DateTime(2026, 1, 15, 10, 0, 0, 0, DateTimeKind.Utc), "Premium noise-cancelling headphones with 30-hour battery life", "https://example.com/images/headphones.jpg", true, "Wireless Bluetooth Headphones", 149.99m, 50, null },
                    { 2, "Furniture", new DateTime(2026, 1, 16, 10, 0, 0, 0, DateTimeKind.Utc), "Adjustable lumbar support with breathable mesh back", "https://example.com/images/chair.jpg", true, "Ergonomic Office Chair", 299.99m, 25, null },
                    { 3, "Kitchen", new DateTime(2026, 1, 17, 10, 0, 0, 0, DateTimeKind.Utc), "Double-walled insulated bottle, keeps drinks cold for 24 hours", "https://example.com/images/bottle.jpg", true, "Stainless Steel Water Bottle", 34.99m, 100, null },
                    { 4, "Electronics", new DateTime(2026, 1, 18, 10, 0, 0, 0, DateTimeKind.Utc), "RGB backlit with Cherry MX switches", "https://example.com/images/keyboard.jpg", true, "Mechanical Gaming Keyboard", 129.99m, 75, null },
                    { 5, "Sports", new DateTime(2026, 1, 19, 10, 0, 0, 0, DateTimeKind.Utc), "Extra thick non-slip exercise mat with carrying strap", "https://example.com/images/yogamat.jpg", true, "Yoga Mat Premium", 45.99m, 60, null },
                    { 6, "Electronics", new DateTime(2026, 1, 20, 10, 0, 0, 0, DateTimeKind.Utc), "Fitness tracking, heart rate monitor, GPS enabled", "https://example.com/images/smartwatch.jpg", true, "Smart Watch Pro", 249.99m, 40, null },
                    { 7, "Furniture", new DateTime(2026, 1, 21, 10, 0, 0, 0, DateTimeKind.Utc), "Adjustable height desk riser for improved ergonomics", "https://example.com/images/deskconverter.jpg", true, "Standing Desk Converter", 179.99m, 30, null },
                    { 8, "Electronics", new DateTime(2026, 1, 22, 10, 0, 0, 0, DateTimeKind.Utc), "20000mAh power bank with fast charging support", "https://example.com/images/powerbank.jpg", true, "Portable Phone Charger", 49.99m, 150, null },
                    { 9, "Kitchen", new DateTime(2026, 1, 23, 10, 0, 0, 0, DateTimeKind.Utc), "12-cup programmable coffee maker with thermal carafe", "https://example.com/images/coffeemaker.jpg", true, "Coffee Maker Deluxe", 89.99m, 45, null },
                    { 10, "Sports", new DateTime(2026, 1, 24, 10, 0, 0, 0, DateTimeKind.Utc), "5 different resistance levels for home workouts", "https://example.com/images/resistancebands.jpg", false, "Resistance Bands Set", 24.99m, 200, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_Category",
                table: "Products",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsActive",
                table: "Products",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_VisitMetrics_Route_Date",
                table: "VisitMetrics",
                columns: new[] { "Route", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactMessages");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "VisitMetrics");
        }
    }
}
