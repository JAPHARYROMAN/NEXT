# @next/database

Typed clients for NEXT's data stores, preconfigured with OTel instrumentation and Vault-managed credentials.

- `createPostgres()` — pooled `postgres` client.
- `createRedis()` — `ioredis` (standalone or cluster).
- `createClickHouse()` — async-insert tuned for high-cardinality event ingestion.

Migration tooling per language:
- Go services → [`golang-migrate`](https://github.com/golang-migrate/migrate)
- Python services → Alembic
- Migrations live under `services/<svc>/migrations/` and run in the deploy pipeline.
