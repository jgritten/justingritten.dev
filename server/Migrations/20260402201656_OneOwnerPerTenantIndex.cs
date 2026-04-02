using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class OneOwnerPerTenantIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Previous slice used "Admin" for the creator; creators are now "Owner" (one per client).
            migrationBuilder.Sql(
                "UPDATE TenantMemberships SET Role = 'Owner' WHERE Role = 'Admin';");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMemberships_OneOwnerPerClient",
                table: "TenantMemberships",
                column: "TenantClientId",
                unique: true,
                filter: "\"Role\" = 'Owner'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TenantMemberships_OneOwnerPerClient",
                table: "TenantMemberships");
        }
    }
}
