using Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260406180000_TenantMemberAndInviteEmails")]
    public partial class TenantMemberAndInviteEmails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MemberEmail",
                table: "TenantMemberships",
                type: "TEXT",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InviteeEmail",
                table: "TenantInvitations",
                type: "TEXT",
                maxLength: 320,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                "UPDATE \"TenantInvitations\" SET \"InviteeEmail\" = \"InviteeEmailNormalized\" WHERE \"InviteeEmail\" IS NULL OR \"InviteeEmail\" = '';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "MemberEmail", table: "TenantMemberships");
            migrationBuilder.DropColumn(name: "InviteeEmail", table: "TenantInvitations");
        }
    }
}
