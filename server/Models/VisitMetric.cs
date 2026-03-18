using System.ComponentModel.DataAnnotations;

namespace Api.Models;

public class VisitMetric
{
    public int Id { get; set; }

    /// <summary>
    /// Route or page identifier, e.g. "/".
    /// </summary>
    [Required]
    [MaxLength(200)]
    public required string Route { get; set; }

    /// <summary>
    /// Date portion for aggregating visits (UTC).
    /// </summary>
    public DateOnly Date { get; set; }

    /// <summary>
    /// Number of visits for the given route and date.
    /// </summary>
    public int Count { get; set; }
}

