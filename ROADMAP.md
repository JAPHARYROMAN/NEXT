# Roadmap

This roadmap tracks the **infrastructure foundation** built in Phase 2 and the major chapters that follow. Product-level roadmaps live in each product's domain board.

## Phase 1 — Doctrine
**Status:** ✅ Complete

The constitution: [AGENTS.md](AGENTS.md). Defines what NEXT is, what it isn't, and the invariants every later decision is judged against.

## Phase 2 — Foundation
**Status:** ✅ Complete (this repo)

Monorepo, ADRs, shared packages, scaffolded services (15), AI systems (8), apps (6), Terraform (AWS), Kubernetes + Helm + ArgoCD, observability, CI/CD, security infra, Kafka event topology, tooling.

## Phase 3 — Identity + Media MVP
**Status:** Next

Goal: usable internal demo of the watch path.

- `auth-service`: passkey + OAuth flows.
- `profile-service`: minimum viable identity.
- `upload-service` + `media-service`: end-to-end video ingest with one rendition tier.
- `apps/web`: home + watch surfaces.
- Observability + canary rollouts for tier-1 services validated.

## Phase 4 — Discovery
- `recommendation-engine` two-tower v1 trained + serving.
- `feed-service` materialized timelines.
- `search-service` BM25 + vector recall + LTR ranker.

## Phase 5 — Live + Social
- `live-service` (RTMP ingest, LL-HLS).
- `community-service` (groups, presence, posts, real-time chat).
- `apps/mobile` v1 release.

## Phase 6 — Commerce
- `payment-service` (tips, subscriptions, payouts).
- Creator agreements + tax flows.

## Phase 7 — AI surface area
- `creator-copilot` (LLM-assisted creator workflows).
- `moderation-models` full ensemble live.
- `apps/studio` integrated AI assistance.

## Phase 8 — Multi-region active-active
- Aurora Global Database, Kafka MirrorMaker, region-aware Route 53.
- Region drill quarterly.

## Phase 9 — Immersive
- `apps/immersive` (NEXT World) v1.
- Spatial 3D embeds across products.

---

Phases are not strictly sequential; teams parallelize where dependencies allow. The constitution gates every phase: anything that violates [SECTION 2](AGENTS.md) does not ship, regardless of urgency.
