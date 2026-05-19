# Runbook — auth-service

Tier 1. Owns OAuth/OIDC + JWT issuance. An auth outage takes the platform with it.

## SLOs

- Login P95 < 250 ms.
- Token verify P99 < 10 ms.
- Refresh availability > 99.95 %.

## Dashboards

- [Auth golden signals](https://grafana.next.io/d/next-auth)
- [Vault key activity](https://grafana.next.io/d/next-vault)

## Common alerts

### `AuthLoginAvailabilityBurning` (page)
Login error budget burning > 14.4× over 1 h.

**First response:**
1. Check Vault availability — `kubectl -n next-security get pods -l app=vault` and `vault status`.
2. Check JWKS endpoint — `curl https://auth.next.io/.well-known/jwks.json | jq`.
3. Recent deploys: `argocd app history auth-service`.

### `AuthRefreshTokenReuseSpike` (page)
A user's refresh token was reused — possible token theft.

**First response:**
1. Identify the affected `family_id` from logs in Loki.
2. The system has *already* invalidated the family.
3. Notify the user via security email.
4. If spike is platform-wide (> 100/min), suspect a JWKS rotation issue.

### `JWKSFetchFailures` (warning)
Verifiers can't fetch the JWKS.

**First response:**
1. Test from a debug pod: `kubectl debug -n next-platform <api-gateway-pod>; curl auth-service.next-identity:8080/.well-known/jwks.json`.
2. Likely network policy or AuthorizationPolicy misconfig — check recent ArgoCD changes.

## Common operations

- Rolling restart: `kubectl -n next-identity rollout restart deployment/auth-service`
- Drain a pod: `kubectl -n next-identity delete pod <name>`
- Force-rotate signing key: `vault write transit/keys/auth-jwt-signing-key/rotate`
- Postgres connection storm: bump `MaxConns` in values.yaml; review slow queries via RDS Performance Insights.

## Escalation

- Primary: `@next-ecosystem/identity` on-call.
- Secondary: `@next-ecosystem/platform` on-call.
- Security council for credential / token compromise.
