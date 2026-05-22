# Phase 15D Image Security & Artifact Reporting

## Scope

Phase 15D hardens the image-build workflow after Phase 15C confirmed that real
build, push, sign, SBOM/provenance, Trivy, and SARIF reporting steps execute.
The fixes stay in CI/toolchain configuration and documentation. Product code is
unchanged.

## Run Investigated

- Workflow run: `26291026221`
- Commit: `9159cc829fbe7ceb3136c0aeb00ef7f6eecd1c2c`
- Workflow: `Image build`
- Event: `push` to `main`

The run produced 9 buildable service images and 6 scaffold-service build
failures. For the 9 buildable services, Trivy wrote SARIF files and exited with
code 1. The console logs only showed SARIF generation and exit code; the SARIF
files were not uploaded because the workflow token lacked security event
permission. To extract the vulnerability table, the exact GHCR image digests
from run `26291026221` were scanned locally with Trivy `0.70.0`, matching the
action version in the logs.

## SARIF Permission Fix

Root cause:

- `github/codeql-action/upload-sarif@v3` needs the workflow token to have
  `security-events: write`.
- The image-build workflow had `contents: read`, `id-token: write`, and
  `packages: write`, but no `security-events` permission.

Remediation:

- Added `security-events: write` to `.github/workflows/image-build.yml`.
- Kept `upload-sarif@v3` enabled.
- Added a per-service SARIF `category` so uploaded Trivy reports are separated
  by matrix service.
- Guarded SARIF upload on the SARIF file existing. This keeps upload enabled for
  scanned images while avoiding a secondary reporting error for scaffold
  services that fail before Trivy runs.

## Vulnerability Findings

All findings came from the Go standard library embedded in
`/usr/local/bin/server`, not from Debian OS packages, the distroless base image,
or generated protobuf artifacts.

Affected service images:

- `analytics-service`
- `api-gateway`
- `auth-service`
- `event-gateway`
- `feed-service`
- `media-service`
- `profile-service`
- `recommendation-service`
- `upload-service`

| Finding | Package | Installed version | Fixed version | Severity | Source | Affected services |
| --- | --- | --- | --- | --- | --- | --- |
| CVE-2025-61726 | `stdlib` | `v1.25.0` | `1.24.12, 1.25.6` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2025-61729 | `stdlib` | `v1.25.0` | `1.24.11, 1.25.5` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2025-68121 | `stdlib` | `v1.25.0` | `1.24.13, 1.25.7, 1.26.0-rc.3` | CRITICAL | Go binary dependency | 9 buildable services |
| CVE-2026-25679 | `stdlib` | `v1.25.0` | `1.25.8, 1.26.1` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2026-32280 | `stdlib` | `v1.25.0` | `1.25.9, 1.26.2` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2026-32281 | `stdlib` | `v1.25.0` | `1.25.9, 1.26.2` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2026-32283 | `stdlib` | `v1.25.0` | `1.25.9, 1.26.2` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2026-33811 | `stdlib` | `v1.25.0` | `1.25.10, 1.26.3` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2026-33814 | `stdlib` | `v1.25.0` | `1.25.10, 1.26.3` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2026-39820 | `stdlib` | `v1.25.0` | `1.25.10, 1.26.3` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2026-39836 | `stdlib` | `v1.25.0` | `1.25.10, 1.26.3` | HIGH | Go binary dependency | 9 buildable services |
| CVE-2026-42499 | `stdlib` | `v1.25.0` | `1.25.10, 1.26.3` | HIGH | Go binary dependency | 9 buildable services |

## Remediation Applied

- Updated the image build Go toolchain from `1.25.0` to `1.25.10`.
- Updated the Dockerfile default `GO_VERSION` to `1.25.10` so local image builds
  without explicit build args use the patched compiler.
- Updated the image-build workflow `GO_VERSION` build arg to `1.25.10`.
- Updated `.mise.toml` to keep the repository Go toolchain pin aligned with the
  patched image compiler.

No Trivy rule was disabled. No vulnerability was suppressed or ignored.

## Validation

- `gh run view 26291026221 --json ...` confirmed Trivy failures on the 9
  buildable service images and build failures on 6 scaffold services.
- Exact run image digests were scanned locally with `aquasec/trivy:0.70.0`.
- A representative patched image build passed:
  `docker build -f services/_template/Dockerfile --build-arg SERVICE=auth-service -t next-auth-service:phase15d-go12510 .`
- A patched local Trivy scan passed with zero HIGH/CRITICAL findings:
  `aquasec/trivy:0.70.0 image --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed next-auth-service:phase15d-go12510`
- `actionlint .github/workflows/image-build.yml` passed.
- `git diff --check` passed.
- `security-events: write` is present in `.github/workflows/image-build.yml`.

## Residual Risk

The original Trivy HIGH/CRITICAL blocker for the 9 buildable services is expected
to be resolved by recompiling with Go `1.25.10`.

The 6 scaffold services remain service-maturity debt and are intentionally not
solved in Phase 15D:

- `live-service`
- `search-service`
- `community-service`
- `payment-service`
- `notification-service`
- `moderation-service`

These services still fail before sign/scan because they lack `cmd/server`. This
branch does not skip them, remove them from the matrix, or add fake entrypoints.

## Expected Workflow Result

After merge, the 9 buildable services are expected to build, push, sign, run
Trivy without HIGH/CRITICAL findings, and upload SARIF successfully.

The full image-build matrix is still expected to fail until the 6 scaffold
services define real `cmd/server` runtime entrypoints or an explicitly approved
image policy is added in a later phase.
