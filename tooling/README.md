# Tooling

Repo tooling that isn't part of any single workspace.

| Directory | Purpose |
| --- | --- |
| `codegen/` | Codegen orchestration scripts (proto, GraphQL, OpenAPI). |
| `lint/` | Custom lint rules + commit hooks. |
| `gen-service/` | Templated new-service generator (creates `services/<name>/` from the template with proto, README, Helm app stub). |

Workspaces under `tooling/` are workspace members of pnpm + Cargo + uv as appropriate.
