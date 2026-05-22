# Phase 15B Build Runtime Reproducibility

## Scope

Phase 15B addresses the runtime failure in the `image-build` workflow where every
service image reached Docker execution and failed during `go mod download` in
`services/_template/Dockerfile`.

The remediation is limited to build and tooling configuration. It does not change
application behavior, service logic, release policy, or workflow coverage.

## Root Cause

The canonical service Dockerfile was not aligned with the repository's Go
workspace:

- `services/_template/Dockerfile` used `golang:1.23.2`, while `go.work` and the
  service modules require Go `1.25.0`.
- `go.work` was copied into the image, but not every module referenced by
  `go.work` was present in the Docker build context. In particular, the
  workspace includes `gen/go`, `packages/go/*`, and the Go helper modules under
  `scripts/e2e-*`.
- Service modules use local `replace` directives such as `../../gen/go` and
  `../../packages/go/telemetry`, so dependency resolution inside Docker requires
  those local modules to exist at the same relative paths.
- Generated protobuf Go packages under `gen/go` are not committed. A container
  build that compiles services importing `github.com/next-ecosystem/next/gen/go`
  must generate those packages before building.
- The standard `buf.gen.yaml` uses remote plugins. Running that path repeatedly
  across image builds can hit remote plugin rate limits, which makes image
  builds less reproducible.

## Build Context Analysis

The workflow builds from the repository root:

```yaml
context: .
file: services/_template/Dockerfile
```

That is the correct context for a workspace-aware image build because service
modules reference sibling repository modules through local relative paths.

The Dockerfile now copies the workspace files and local modules required for Go
module resolution:

- `go.work` and `go.work.sum`
- `buf.yaml`, `buf.lock`, `buf.gen.yaml`, and `buf.gen.docker.yaml`
- `gen/go/go.mod` and `gen/go/go.sum`
- `packages/go`
- `packages/events`
- `scripts/e2e-jwt` and `scripts/e2e-register`
- `services`

The workflow does not build through the older service-local Dockerfiles. It uses
the canonical template for all matrix entries.

## Module And Workspace Analysis

The service modules are intentionally independent Go modules while still sharing
a root Go workspace for development and CI. Keeping `go.work` active in the
container is the least surprising strategy because it matches local CI behavior
and preserves workspace-level resolution.

The selected service still runs its own module download:

```sh
cd services/${SERVICE} && go mod download
```

That command now succeeds because the container includes the Go 1.25 toolchain
and the local workspace modules expected by `go.work` and service-level
`replace` directives.

## Remediation Chosen

The Docker build now uses a multi-stage, workspace-aware strategy:

- Pin the image Go toolchain to Go `1.25.0`, matching `go.work`.
- Pin Alpine to `3.22`, matching the Go 1.25 image line.
- Copy all Go workspace modules needed for module resolution.
- Install pinned local protoc plugins:
  - `protoc-gen-go@v1.34.2`
  - `protoc-gen-go-grpc@v1.5.1`
- Add `buf.gen.docker.yaml` so Docker code generation uses local plugins instead
  of remote plugin execution.
- Generate protobuf code inside the build before compiling services.
- Preserve the `api-gateway` gqlgen path by running gqlgen only for that service.
- Keep strict runtime validation by failing if a matrix service lacks
  `cmd/server`.

## Tradeoffs

Copying `services` into the builder makes the Docker context broader than a
single-service-only context, but it keeps Go workspace resolution deterministic
and avoids hardcoded local paths, vendoring, or bypassing `go mod download`.

Using local buf plugins adds a small tool-install step to the build, but removes
remote plugin rate-limit exposure from the image build path.

Keeping `go.work` active preserves consistency with repository CI. Per-service
module isolation would be possible, but it would require more bespoke Docker
logic and would diverge from the repo's current workspace model.

## Validation

Local validation performed on the Phase 15B branch:

- `docker build -f services/_template/Dockerfile --build-arg SERVICE=auth-service -t next-auth-service:phase15b .` passed.
- `docker build -f services/_template/Dockerfile --build-arg SERVICE=api-gateway -t next-api-gateway:phase15b .` passed, including the gqlgen path.
- Local 15-service matrix execution produced 9 passing service images.
- The remaining 6 matrix entries failed only because the service module does not
  define `cmd/server`, not because of `go mod download`, workspace resolution, or
  generated protobuf code.
- `actionlint .github/workflows/image-build.yml` passed.
- YAML parsing passed for `.github/workflows/image-build.yml` and
  `buf.gen.docker.yaml`.
- `git diff --check` passed.

## Remaining Risks

The original `go mod download` blocker is resolved. The complete image-build
workflow is not expected to be fully green until these scaffold services define
real runtime entrypoints or a separate approved image policy is created:

- `live-service`
- `search-service`
- `community-service`
- `payment-service`
- `notification-service`
- `moderation-service`

This branch intentionally does not skip those services, remove them from the
matrix, or add fake runtime binaries. The failures are now actionable service
implementation debt instead of Docker/module-resolution failures.

## Future Improvements

- Add real `cmd/server` runtime entrypoints for the scaffold services.
- Decide whether scaffold-only services need an explicit non-runtime policy
  before they appear in release image matrices.
- Consider a shared build metadata file for service maturity, runtime ownership,
  and release eligibility once the service-layout classification work lands.
- Add a small CI check that fails early when a service is listed in the image
  matrix but does not define `cmd/server`.
