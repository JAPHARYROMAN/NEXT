# Event Privacy Rules

NEXT analytics is privacy-safe by default.

## Forbidden Raw Fields

Do not store raw:

- IP addresses
- precise location
- full user agents
- passwords
- tokens
- private messages
- payment secrets

## Required Patterns

- Hash network and device identifiers before persistence.
- Store query hashes and query length, not raw search text.
- Keep `metadata.ip_hash` and `metadata.user_agent_hash` nullable.
- Respect consent-aware tracking flags in identity/session events.
- Use coarse region identifiers such as cloud region or country-level routing region.

## Enforcement

`event-gateway` rejects known raw private fields in payloads. `analytics-service` validates envelopes again before ClickHouse writes so bypassed or replayed malformed events are routed to DLQ instead of analytics tables.
