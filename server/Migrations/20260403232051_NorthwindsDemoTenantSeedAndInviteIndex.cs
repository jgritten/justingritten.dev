using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class NorthwindsDemoTenantSeedAndInviteIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TenantInvitations_TenantClientId",
                table: "TenantInvitations");

            migrationBuilder.InsertData(
                table: "TenantClients",
                columns: new[] { "Id", "CreatedAtUtc", "Name", "IsDeleted" },
                values: new object[] { new Guid("c4a6e8d0-9b2f-4e7a-8c1d-0f5e6d7c8b4a"), new DateTime(2026, 4, 2, 12, 0, 0, 0, DateTimeKind.Utc), "Northwinds Demo", false });

            migrationBuilder.CreateIndex(
                name: "IX_TenantInvitations_Pending_UniqueTenantEmail",
                table: "TenantInvitations",
                columns: new[] { "TenantClientId", "InviteeEmailNormalized" },
                unique: true,
                filter: "\"Status\" = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TenantInvitations_Pending_UniqueTenantEmail",
                table: "TenantInvitations");

            migrationBuilder.DeleteData(
                table: "TenantClients",
                keyColumn: "Id",
                keyValue: new Guid("c4a6e8d0-9b2f-4e7a-8c1d-0f5e6d7c8b4a"));

            migrationBuilder.CreateIndex(
                name: "IX_TenantInvitations_TenantClientId",
                table: "TenantInvitations",
                column: "TenantClientId");
        }
    }
}
