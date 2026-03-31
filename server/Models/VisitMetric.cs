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
    /// UTC timestamp when the visit event was recorded.
    /// </summary>
    public DateTime OccurredAtUtc { get; set; }

    /// <summary>
    /// Number of visits represented by this event row.
    /// </summary>
    public int Count { get; set; }
}

