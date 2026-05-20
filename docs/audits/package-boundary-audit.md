# Package Boundary Audit

- **Phase**: 10 — System Integration Review
- **Date**: 2026-05-20
- **Auditor**: Claude (architecture governor)
- **Scope**: `/packages` and `/apps`

## Executive summary

`/packages` holds **~39 TypeScript packages** plus nested `packages/go/*`,
`packages/rust/*`, `packages/python/*` module collections. Classification is
clean — every package has a real implementation, no backend logic leaked into a
TS package, and no stale empty stubs. `/apps` holds **10 applications**, all with
real `src/` code, all consuming SDKs/contracts rather than backend internals.

Two structural risks: the **UI package family has proliferated to ~12 packages**
(fragmentation watch), and **event-type definitions exist in two parallel
styles** (hand-written mirror packages vs. the `@next/events` schema/contract
package). No P0/P1; the package layer is the healthiest part of the system.

## Package classification

| Class         | Packages                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| shared-types  | `types`, `identity-types`, `permissions`, `media-events`, `trust-events`, `feed-types`                                                                       |
| SDK           | `auth-sdk`, `api-client`, `media-sdk`, `recommendation-sdk`, `upload-sdk`, `player-controls`                                                                 |
| UI            | `design-system`, `theme-system`, `animation-system`, `layout-engine`, `icons`, `ui`, `media-ui`, `creator-ui`, `studio-components`, `charts`, `video-player` |
| telemetry     | `logger`, `telemetry`                                                                                                                                        |
| events        | `events`                                                                                                                                                     |
| config        | `config`                                                                                                                                                     |
| database-util | `database`                                                                                                                                                   |
| frontend-util | `frontend-utils`, `session-utils`, `security-utils`, `feature-flags`, `access-control`, `discovery-utils`, `streaming-utils`, `embedding-utils`              |
| go-module     | `packages/go/*` (eventbus, auth, database, telemetry)                                                                                                        |
| rust-crate    | `packages/rust/*` (telemetry, eventbus, proto)                                                                                                               |
| python-pkg    | `packages/python/*` (telemetry)                                                                                                                              |

## Apps

All 10 apps (`web`, `admin`, `auth-portal`, `account-center`, `studio`,
`studio-media-console`, `live-control-room`, `mobile`, `tv`, `immersive`) have
real `src/` code. No app contains backend/service logic or direct database
access; all reach the backend through the GraphQL gateway and `@next/*` SDKs.

## Findings

### PB-1 — No backend logic in TS packages; no misplaced code · Severity: PASS

**Evidence**: Audit of all TS packages found no service orchestration, no direct
DB drivers, and no backend gRPC servers inside `/packages`. `database` is a
client-wrapper utility, not a backend. Apps consume SDKs only.
**Recommended action**: None. Record as conformant.
**Owner**: — · **Blocker**: No · **Next step**: Keep enforced via PR review.

### PB-2 — UI package family proliferation · Severity: P3

**Evidence**: Twelve packages occupy the UI/visual layer: `design-system`,
`theme-system`, `animation-system`, `layout-engine`, `icons`, `ui`, `media-ui`,
`creator-ui`, `studio-components`, `charts`, `video-player`, `player-controls`.
Each is individually well-scoped, but the surface area is large and was produced
rapidly by one agent (Composer). The boundary between `design-system` /
`theme-system` / `animation-system` and between `ui` / `media-ui` / `creator-ui`
/ `studio-components` is convention, not enforced — a future merge could create
real overlap.
**Recommended action**: Document a UI-package taxonomy (a short ADR or a section
in `packages/README.md`) stating the responsibility line between each. No
consolidation needed now — this is a watch item.
**Owner**: Claude (taxonomy doc) + Composer (review) · **Blocker**: No · **Next
step**: Roadmap P3 item.

### PB-3 — Two event-type definition styles · Severity: P2

**Evidence**: `@next/events` owns the canonical event layer (schemas + Zod
contracts + topic catalog). Separately, `@next/media-events` and
`@next/trust-events` are hand-written TS packages "mirroring" `media.*` /
`trust.*` Kafka events. Hand-written mirrors drift from the schema source of
truth the moment a schema changes.
**Recommended action**: Decide that `@next/events` (schemas → generated/contract
types) is the single source of truth; downgrade `media-events` / `trust-events`
to thin re-exports from `@next/events`, or deprecate them. Covered jointly with
event-architecture-audit finding EA-2.
**Owner**: Codex (events package) · **Blocker**: No · **Next step**: See
[event-architecture-audit.md](event-architecture-audit.md) EA-2.

### PB-4 — `packages/README.md` index lags reality · Severity: P3

**Evidence**: `packages/README.md` lists ~26 packages; the directory holds ~39.
The recommendation packages were added (Phase 8) but the many UI/frontend
packages from parallel Composer work are not all indexed.
**Recommended action**: Refresh the `packages/README.md` table to list all
current packages. Low effort.
**Owner**: Claude (docs) · **Blocker**: No · **Next step**: Roadmap P3 item.

### PB-5 — Naming + ownership are consistent · Severity: PASS

**Evidence**: Every TS package uses the `@next/*` scope; nested modules follow
`packages/{go,rust,python}/*`. No naming drift across agents.
**Recommended action**: None.
**Owner**: — · **Blocker**: No · **Next step**: —

## Conclusion

The package layer is coherent and the app→SDK→backend boundary holds cleanly.
The only real architectural debt is the **dual event-type style** (P2, PB-3 /
EA-2). The UI proliferation (P3) is a watch item, not yet a defect.
