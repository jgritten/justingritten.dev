using Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260327111500_AddVisitMetricTimestampBuckets")]
    public partial class AddVisitMetricTimestampBuckets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE TABLE VisitMetrics_new (
                    Id INTEGER NOT NULL CONSTRAINT PK_VisitMetrics PRIMARY KEY AUTOINCREMENT,
                    Route TEXT NOT NULL,
                    OccurredAtUtc TEXT NOT NULL,
                    Count INTEGER NOT NULL
                );

                INSERT INTO VisitMetrics_new (Id, Route, OccurredAtUtc, Count)
                SELECT Id, Route, datetime(Date || ' 00:00:00'), Count
                FROM VisitMetrics;

                DROP TABLE VisitMetrics;
                ALTER TABLE VisitMetrics_new RENAME TO VisitMetrics;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_VisitMetrics_OccurredAtUtc",
                table: "VisitMetrics",
                column: "OccurredAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_VisitMetrics_Route_OccurredAtUtc",
                table: "VisitMetrics",
                columns: new[] { "Route", "OccurredAtUtc" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE TABLE VisitMetrics_old (
                    Id INTEGER NOT NULL CONSTRAINT PK_VisitMetrics PRIMARY KEY AUTOINCREMENT,
                    Route TEXT NOT NULL,
                    Date TEXT NOT NULL,
                    Count INTEGER NOT NULL
                );

                INSERT INTO VisitMetrics_old (Id, Route, Date, Count)
                SELECT Id, Route, date(OccurredAtUtc), Count
                FROM VisitMetrics;

                DROP TABLE VisitMetrics;
                ALTER TABLE VisitMetrics_old RENAME TO VisitMetrics;

                CREATE UNIQUE INDEX IX_VisitMetrics_Route_Date
                ON VisitMetrics (Route, Date);
                """);
        }
    }
}
