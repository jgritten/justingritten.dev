using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore.Storage;

namespace Api.Data;

/// <summary>
/// Retries database operations on SQLite transient errors (e.g. busy/locked under concurrency).
/// Use with SQLite now; when switching to a hosted DB (e.g. SQL Server, PostgreSQL), replace with
/// that provider's built-in retrying strategy (e.g. SqlServerRetryingExecutionStrategy).
/// </summary>
public sealed class SqliteRetryingExecutionStrategy : ExecutionStrategy
{
    private const int SqliteBusy = 5;
    private const int SqliteLocked = 6;

    public SqliteRetryingExecutionStrategy(
        ExecutionStrategyDependencies dependencies,
        int maxRetryCount = 5,
        TimeSpan? maxRetryDelay = null)
        : base(dependencies, maxRetryCount, maxRetryDelay ?? TimeSpan.FromSeconds(30))
    {
    }

    protected override bool ShouldRetryOn(Exception exception)
    {
        if (exception is SqliteException sqliteEx)
        {
            var code = sqliteEx.SqliteErrorCode;
            // 5 = SQLITE_BUSY, 6 = SQLITE_LOCKED - transient under concurrent load
            if (code == SqliteBusy || code == SqliteLocked)
                return true;
        }

        return false;
    }
}
