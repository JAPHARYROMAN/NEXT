# Inherits the canonical NEXT service Dockerfile.
# Build context must be the repo root: `docker build -f services/profile-service/Dockerfile --build-arg SERVICE=profile-service .`
# This file simply forwards to the shared template.
# syntax=docker/dockerfile:1.10
# Pass SERVICE=profile-service when building.
FROM scratch AS marker
LABEL next.service="profile-service"
LABEL next.dockerfile="services/_template/Dockerfile"
