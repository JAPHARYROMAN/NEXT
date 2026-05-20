# Security & Observability Audit

- **Phase**: 10 — System Integration Review
- **Date**: 2026-05-20
- **Auditor**: Claude (architecture governor)
- **Scope**: observability instrumentation, secrets, auth boundaries, infrastructure security — against [ADR 0009](../adr/0009-observability.md), [ADR 0010](../adr/0010-secrets.md), [ADR 0018](../adr/0018-workload-identity.md), [ADR 0027](../adr/0027-signed-playback-urls.md)

## Executive summary

**Observability**: every one of the 19 functional services is OpenTelemetry-
instrumented and exposes `/healthz` + `/readyz`. The 20 scaffolds have none —
expected, as they have no entrypoint. **Security**: no secrets are committed,
`.env` is gitignored, signed playback URLs follow [ADR 0027](../adr/0027-signed-playback-urls.md),
and infrastructure security (Vault, External Secrets, OPA, Istio mTLS) is
defined. No P0/P1 security findings. The one real gap is **thin test coverage on
security-critical paths** (auth, gateway JWT), carried as a P1 in the service
maturity matrix.

## Observability findings

### SO-1 — Functional services uniformly instrumented · Severity: PASS

**Evidence**: All 19 functional services call the shared `telemetry` package in
`cmd/server/main.go`, set an OTLP exporter, install a composite trace
propagator, and expose `/healthz` (liveness) + `/readyz` (readiness, with a
dependency probe). gRPC servers use `otelgrpc`; HTTP uses `otelhttp`.
**Recommended action**: None. This is conformant with [ADR 0009](../adr/0009-observability.md).
**Owner**: — · **Blocker**: No · **Next step**: Keep the PR-template
observability gate enforcing it.

### SO-2 — Scaffold services have no telemetry · Severity: P3 (informational)

**Evidence**: The 20 scaffold services have no `main.go`, hence no telemetry.
**Recommended action**: The canonical service layout (RB-4) and the `_template`
must include the telemetry bootstrap so instrumentation is automatic when a
scaffold is built. No action while they remain scaffolds.
**Owner**: Codex · **Blocker**: No · **Next step**: Verify `_template` includes
the OTel bootstrap.

### SO-3 — Trace propagation verified across services · Severity: PASS

**Evidence**: Services install `CompositeTextMapPropagator(TraceContext,
Baggage)` and Kafka producers/consumers carry W3C trace context in headers
(established in Phase 3). Cross-service traces are not islanded.
**Recommended action**: None.
**Owner**: — · **Blocker**: No · **Next step**: —

## Security findings

### SO-4 — No committed secrets · Severity: PASS

**Evidence**: Grep for credential patterns across committed files found none.
`.gitignore` covers `.env`, `.env.local`, `.env.*.local`. No `.env` file is
tracked.
**Recommended action**: None.
**Owner**: — · **Blocker**: No · **Next step**: —

### SO-5 — `docker-compose.yml` uses plaintext local credentials · Severity: P3

**Evidence**: `docker-compose.yml` sets `POSTGRES_USER/PASSWORD: next`; Kafka,
Redis, ClickHouse run without auth. The file is explicitly the local-dev tier.
**Recommended action**: Acceptable for local dev. Ensure `docker-compose.yml` is
never used as a production manifest and is excluded from built images. Production
credentials flow through Vault + External Secrets ([ADR 0010](../adr/0010-secrets.md)).
**Owner**: Codex (infra) · **Blocker**: No · **Next step**: Confirm image builds
do not copy compose.

### SO-6 — Service-to-service auth relies on the mesh, not the app · Severity: P2

**Evidence**: Deep gRPC services do not perform application-level service-to-
service authentication; they assume the Istio ambient mesh provides mTLS
([ADR 0003](../adr/0003-service-mesh.md)) and SPIFFE/SPIRE workload identity
([ADR 0018](../adr/0018-workload-identity.md)). Locally they run plaintext gRPC.
This is a valid design — but it is implicit, not asserted anywhere.
**Recommended action**: Document explicitly (in the security doc or an ADR note)
that the mesh is the service-to-service trust boundary and app-level service
auth is intentionally deferred. Verify mesh mTLS is `STRICT` in non-local
environments.
**Owner**: Claude (doc) + Codex (mesh config) · **Blocker**: No · **Next step**:
Roadmap P2 item.

### SO-7 — Signed playback URLs conform to ADR 0027 · Severity: PASS

**Evidence**: Playback uses per-session signed, short-TTL URLs; access is gated
through the access-control PDP; signing keys are managed at the CDN edge.
**Recommended action**: None.
**Owner**: — · **Blocker**: No · **Next step**: —

### SO-8 — Security-critical paths are under-tested · Severity: P1 (cross-ref SM-1)

**Evidence**: `auth-service` has 1 test; `api-gateway` (JWT verification path)
has 0; `access-control-service`, `session-service`, `notification-auth-service`
have 0. Auth and authorization logic is shipping without regression tests.
**Recommended action**: Prioritize tests for auth/authz/JWT paths above other
test backfill. Required before any identity service is promoted to production.
**Owner**: Codex · **Blocker**: Yes for production promotion · **Next step**:
Roadmap P1 item; see [service-maturity-matrix.md](service-maturity-matrix.md) SM-1.

## Infrastructure posture

`infrastructure/` is well-formed: `terraform/` (AWS IaC), `kubernetes/` + Helm +
`argocd/` (GitOps), `monitoring/` (OTel collector, Prometheus, Grafana, Loki,
Tempo), `security/` (Vault, OPA, mTLS, RBAC), `secrets/` (External Secrets
Operator). No missing-environment or weak-default findings at the IaC layer.

## Conclusion

Security and observability posture is **solid by design**. The actionable gap is
**testing**, not architecture: security-critical code paths (SO-8) need
regression coverage before production promotion. SO-6 (implicit mesh trust
boundary) should be made explicit in documentation.
