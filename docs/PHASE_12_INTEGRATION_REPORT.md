# Phase 12 Integration Report

## Proto Compatibility

Status: COMPLETE WITH KNOWN NON-BLOCKER

Chosen option: Option B - accept intentional breaking.

`buf lint` is green on the integrated proto set. `buf breaking` against `main`
detects the known Phase 12.1 event proto Go package stabilization break:

```txt
packages/events/schemas/auth/v1/user_registered.proto:8:1:
File option "go_package" changed from
"github.com/next-ecosystem/next/gen/go/auth/v1;authv1"
to
"github.com/next-ecosystem/next/gen/go/next/events/auth/v1;autheventsv1".
```

Option A was not viable because `main` has mixed `go_package` values inside the
same protobuf package `next.events.auth.v1`:

- `user_registered.proto` uses the old `gen/go/auth/v1;authv1` package.
- `session_started.proto` already uses the event-oriented
  `gen/go/next/events/auth/v1;autheventsv1` package.

Restoring only `user_registered.proto` fails `buf lint`. Restoring both auth
event files creates a new breaking change for `session_started.proto`.

Governance record: [ADR 0042](adr/0042-event-proto-go-package-stabilization.md).

CI handling:

- Keep `buf lint` required.
- Keep `buf breaking` required.
- During Phase 12.1, classify exactly the `user_registered.proto` `go_package`
  rename documented above as a known non-blocker.
- Treat every other Buf breaking finding as blocking unless it has its own ADR
  or compatibility fix.
- Once Phase 12.1 lands on `develop`, compare future branches against the
  updated stabilized baseline so this accepted pre-MVP break is not repeatedly
  re-triaged.

Develop acceptance: yes, develop can accept this as a known non-blocker because
it is pre-MVP, documented by ADR 0042, lint-clean, and narrowly scoped to an
internal generated Go package path.
