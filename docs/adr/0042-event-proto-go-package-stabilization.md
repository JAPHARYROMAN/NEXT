# 0042. Event proto Go package stabilization break

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture, Backend, Infrastructure
- **Tags**: proto, buf, events, go, stabilization, ci

## Context

Phase 12.1 integration verification found that `buf breaking` against `main`
reports a breaking change in `packages/events/schemas/auth/v1/user_registered.proto`:

```txt
File option "go_package" changed from
"github.com/next-ecosystem/next/gen/go/auth/v1;authv1"
to
"github.com/next-ecosystem/next/gen/go/next/events/auth/v1;autheventsv1".
```

The current integration branch is lint-clean because both files in protobuf
package `next.events.auth.v1` use the same event-oriented Go package:

- `packages/events/schemas/auth/v1/user_registered.proto`
- `packages/events/schemas/auth/v1/session_started.proto`

The `main` baseline is internally inconsistent for this package:

- `user_registered.proto` uses `gen/go/auth/v1;authv1`.
- `session_started.proto` already uses `gen/go/next/events/auth/v1;autheventsv1`.

That means an Option A compatibility-only fix cannot satisfy both gates:

- Restoring only `user_registered.proto` to the old `go_package` fails `buf lint`
  because files in one protobuf package have different `go_package` values.
- Restoring both auth event files to the old `go_package` creates a new breaking
  change for `session_started.proto`.

## Decision

Accept the `user_registered.proto` Go package rename as an intentional
pre-MVP stabilization break, keep the integration branch lint-clean, and require
the break to remain visible in CI and integration reports until `develop` or
`main` is rebased onto the stabilized event proto layout.

## Rationale

The stabilized layout keeps all auth event protobufs under the same generated Go
package. That is the only state that satisfies Buf lint and matches the event
schema source-of-truth policy in ADR 0039. Preserving the old generated package
for one event while the other event in the same protobuf package uses the new
layout would preserve an inconsistent baseline rather than a useful contract.

This is acceptable only because NEXT is still pre-MVP and no production contract
has been published for the old generated Go package path.

## Alternatives considered

- **Option A - avoid breaking by restoring `user_registered.proto` only**.
  Rejected because it fails `buf lint` with mixed `go_package` values in
  `next.events.auth.v1`.
- **Option A - restore all auth event protos to the old Go package**. Rejected
  because it creates a breaking `go_package` change for `session_started.proto`,
  which already uses the new event package path on `main`.
- **Disable or weaken Buf breaking checks**. Rejected because proto governance
  must remain explicit and reviewable.

## Consequences

### Positive

- `buf lint` remains green.
- Auth event generated Go bindings have one coherent package path.
- The event schema layout aligns with ADR 0039.

### Negative

- `buf breaking` against `main` remains red for the known
  `user_registered.proto` `go_package` rename until the stabilized branch is
  accepted as the new baseline.

### Neutral / open questions

- After this stabilization lands, CI should compare future branches against the
  updated integration or develop baseline rather than repeatedly re-reporting the
  same accepted pre-MVP break.

## Implementation rules

- Do not change `buf.yaml` to hide this breaking change.
- Do not add a broad `go_package` breaking exception.
- Keep `buf lint` required.
- Keep `buf breaking` required for all future proto changes.
- During Phase 12.1 only, CI may classify exactly this finding as a known
  non-blocker:
  `packages/events/schemas/auth/v1/user_registered.proto` `go_package` changed
  from `gen/go/auth/v1;authv1` to `gen/go/next/events/auth/v1;autheventsv1`.
- Any additional Buf breaking finding remains blocking and requires a new ADR or
  a compatibility fix.

## Agent instructions

- **Claude** - Treat this ADR as the explicit governance record for the Phase
  12.1 proto break and keep integration reports aligned with it.
- **Codex** - Do not revert the auth event `go_package` layout just to satisfy
  `main`; preserve lint-clean proto packages and report this known break
  explicitly.
- **Composer** - No frontend action.
- **Copilot** - Do not add local generated-code patches for this break.

## Review triggers

- Revisit after Phase 12.1 merges to `develop`.
- Revisit before any public event proto package is published or consumed outside
  the monorepo.
- Revisit if another `buf breaking` finding appears against event schemas.

## Related documents

- [0039. Protobuf event-definition source of truth](0039-event-schema-source-of-truth.md)
- [0040. Generated Go code tracking policy](0040-generated-go-code-tracking-policy.md)
