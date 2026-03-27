namespace Api.DTOs;

public record RecordVisitRequestDto(string Route);

public record VisitSummaryDto(string Route, int TotalCount);
