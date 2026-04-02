using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantTenancy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantClients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantClients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantUserPreferences",
                columns: table => new
                {
                    ClerkUserId = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    DefaultTenantClientId = table.Column<Guid>(type: "TEXT", nullable: true),
                    SkipHubWhenDefaultAvailable = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantUserPreferences", x => x.ClerkUserId);
                });

            migrationBuilder.CreateTable(
                name: "TenantInvitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TenantClientId = table.Column<Guid>(type: "TEXT", nullable: false),
                    InviteeEmailNormalized = table.Column<string>(type: "TEXT", maxLength: 254, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantInvitations_TenantClients_TenantClientId",
                        column: x => x.TenantClientId,
                        principalTable: "TenantClients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantMemberships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClerkUserId = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    TenantClientId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantMemberships_TenantClients_TenantClientId",
                        column: x => x.TenantClientId,
                        principalTable: "TenantClients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantClients_IsDeleted",
                table: "TenantClients",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInvitations_InviteeEmailNormalized_Status",
                table: "TenantInvitations",
                columns: new[] { "InviteeEmailNormalized", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantInvitations_TenantClientId",
                table: "TenantInvitations",
                column: "TenantClientId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMemberships_ClerkUserId",
                table: "TenantMemberships",
                column: "ClerkUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMemberships_ClerkUserId_TenantClientId",
                table: "TenantMemberships",
                columns: new[] { "ClerkUserId", "TenantClientId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantMemberships_TenantClientId",
                table: "TenantMemberships",
                column: "TenantClientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantInvitations");

            migrationBuilder.DropTable(
                name: "TenantMemberships");

            migrationBuilder.DropTable(
                name: "TenantUserPreferences");

            migrationBuilder.DropTable(
                name: "TenantClients");
        }
    }
}
