# ADR 0008: Metrics overview endpoint for period-scoped dashboard data

## Status

Accepted

## Context

The dashboard needs period-based metrics (`hour`, `day`, `week`, `month`) and currently has to make many individual summary calls per route. This creates extra network traffic and makes it harder to keep chart, route, and outbound CTA metrics aligned to the same time window.

The existing `GET /api/metrics/summary?route=...` endpoint is still useful for focused route checks, but it is not sufficient for one-call dashboard hydration.

## Decision

Add a new aggregate endpoint:

- `GET /api/metrics/overview?period=hour|day|week|month`

Response includes:

- `period`, `fromDate`, `toDate`
- `routeTotals`: non-outbound route totals for the selected window
- `outboundTotals`: `/outbound/*` totals for the selected window
- `dailyTotals`: daily total counts for the selected window

Keep `GET /api/metrics/summary` unchanged for single-route queries.

## Consequences

- Dashboard can fetch period-scoped metrics in one request.
- Route and outbound metrics are time-window consistent.
- Existing single-route API usage remains backward compatible.
- Current visit storage is daily (`DateOnly`), so `hour`/`day` windows are constrained by daily granularity until a finer event model is introduced.
