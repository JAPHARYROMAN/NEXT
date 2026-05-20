# NEXT Graceful Degradation

> The constitution's rule is **degrade, never block**. When a subsystem fails,
> NEXT serves a worse-but-coherent experience — never an error page, never a
> spinner of death, never a chaotic one.

## 0. Doctrine

Every NEXT subsystem has a **degradation chain**: an ordered sequence of
fallbacks from "full experience" down to "minimal but coherent". The rules:

1. **Always reach a coherent state.** Every chain terminates in something a user
   can use — not an error.
2. **Degradation is observable.** Each step down emits a signal and increments a
   metric; the platform always knows it is degraded and by how much.
3. **Degradation is automatic and self-healing.** Fallbacks engage on failure
   detection (circuit breakers, timeouts, health) and disengage automatically on
   recovery.
4. **Degrade by tier.** Under resource pressure, T2/T3 features
   ([global-topology.md](global-topology.md) §4) degrade _first_ to protect
   T0/T1.
5. **Tell the user when it matters.** Silent degradation is fine for invisible
   internals; user-visible degradation (e.g. lower video quality) gets a quiet,
   honest indicator — not an alarm.

## 1. The circuit-breaker pattern

Every cross-service and cross-region call is wrapped in a **circuit breaker**
with a timeout, a failure threshold, and a fallback:

```
call dependency ──▶ [breaker closed]  ──▶ normal path
                    [breaker open]    ──▶ fallback (next step in the chain)
                    [breaker half-open] ─▶ probe; close on success
```

Breakers prevent the cascade: a slow dependency trips its breaker quickly, so
callers fall back instead of piling up blocked requests and dragging down
healthy services.

## 2. Degradation chains

### Media playback

```
adaptive HLS/DASH, best rung
  → lower bitrate rung (network or transcode pressure)
  → last cached segment continues (origin/CDN miss)
  → poster frame + "resume shortly" (total playback failure)
```

Playback is **T0** — its chain is the most-defended. A viewer mid-stream during
an incident keeps watching from edge cache; a new start falls to the lowest
rung before it fails. See [media-resilience.md](media-resilience.md).

### Recommendations & feed

```
personalized ranked feed (full funnel)
  → cached slate (last good slate for this user, short TTL)
  → trending feed (regional, non-personalized)
  → editorial / chronological fallback (no ranking at all)
```

The feed is **never empty**. If the recommendation funnel
([docs/recommendation](../recommendation/architecture.md)) is down, the user
still gets trending or chronological content — a worse feed, not no feed.

### AI features

```
full model inference
  → smaller / cheaper model
  → heuristic fallback (rules, popularity, recency)
  → cached prior result
  → feature quietly off (e.g. no auto-captions this session)
```

AI failure must **never** collapse feeds or block playback — AI is enrichment.
See [ai-resilience.md](ai-resilience.md).

### Search

```
hybrid lexical + semantic search
  → lexical-only (vector store unavailable)
  → cached popular results for the query
  → "search is degraded" + browse entry points
```

### Community & social

```
full read-write
  → read-only (writes queued, not lost — see below)
  → cached read-only (stale but coherent)
```

During read-only mode, writes (comments, posts, reactions) are **accepted into a
durable queue** and applied when the subsystem recovers — the user is told their
action is "pending", and it is not lost.

### Upload

```
resumable chunked upload
  → pause + resume from last committed chunk (upload-service is already resumable)
  → client-side hold + retry (regional upload endpoint down)
```

An interrupted upload never restarts from zero.

## 3. Load shedding

When a region is over capacity (a viral spike, a partial outage concentrating
load), NEXT **sheds load by tier** rather than failing uniformly:

1. Pause T3 (batch, reporting).
2. Degrade T2 to its cheapest fallback (heuristic recommendations, lexical
   search).
3. Protect T0/T1 — playback, auth, media — with the freed capacity.
4. If still saturated, apply **fair-queueing admission control**: new sessions
   may briefly queue, but in-progress playback is never dropped.

Load shedding is the deliberate inverse of a cascading failure — the platform
chooses what to sacrifice instead of failing randomly.

## 4. Degradation state & recovery

- A platform-wide **degradation level** per region is computed from active
  fallbacks and surfaced on the operations dashboard.
- Each degradation engages via circuit breaker / health signal and **disengages
  automatically** when the dependency is healthy for a stable window — no manual
  re-enable, no risk of staying degraded after recovery.
- Degradation events flow to observability ([sre-doctrine.md](sre-doctrine.md))
  and, where coordination matters, onto the event bus.

## 5. What "never feel broken" means

The test for every chain: at the worst reachable step, can a user still **watch
something, find something, and trust the platform**? If yes, the degradation is
acceptable. If any chain bottoms out at an error page, a chaotic UI, or an
unrecoverable state, the chain is incomplete and is a resilience defect.

## Related documents

- [global-topology.md](global-topology.md) · [media-resilience.md](media-resilience.md) · [ai-resilience.md](ai-resilience.md) · [sre-doctrine.md](sre-doctrine.md)
