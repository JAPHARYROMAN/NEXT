# NEXT Live Moderation

> Moderating something that is happening _now_. Live has no publish step to
> gate, no post-hoc takedown that fully undoes harm, and an audience reacting in
> real time. It needs its own architecture.

## 0. Why live is different

The five-layer pipeline ([moderation-pipelines.md](moderation-pipelines.md))
assumes content is created, then evaluated, then published. A live stream is
published _continuously_. Three consequences:

1. **Detection must be sub-second** — a harm that runs for 30 seconds has
   already reached the whole audience.
2. **Intervention must be graceful** — you cannot "unpublish" a live moment;
   you can cut, delay, age-gate, or end the stream.
3. **The audience is part of the surface** — chat, reactions, raids, and clip
   creation are all live-abuse vectors, not just the broadcaster's video.

## 1. The live pipeline

Live runs a continuously-sampled variant of the standard pipeline.

```
 stream ingest ─┬─ video frames  ─┐
                ├─ audio (ASR)    ├─▶ L1 fast detectors ─▶ L2 streaming AI ─▶ L3 live risk score
                └─ chat / events ─┘                                              │
                                                          ┌───────────────────────┤
                                              graceful intervention      live human console
                                              (delay · cut · gate · end)  (operator escalation)
```

- **Sampling, not full-frame** — video is sampled at an adaptive rate (higher
  when risk is elevated); audio is transcribed continuously; chat is evaluated
  per message.
- **Streaming AI** — L2 models run in a streaming mode over a rolling window so
  _temporal_ context (an escalating situation) is visible, not just single
  frames.
- **Live risk score** — L3 maintains a continuously-updated `live_risk` for the
  stream, fusing broadcaster signals, audience signals, and trust context.

## 2. Broadcast-delay buffer

NEXT live runs on a short **broadcast delay** (a few seconds, configurable by
content category and broadcaster trust). The delay buffer is the single most
important live-safety mechanism: it gives the pipeline a window to act _before_
the audience sees a frame. When `live_risk` crosses a threshold within the
buffer window, the pipeline can drop or blur the offending segment before it
ships. The delay is invisible to the audience and is the difference between
"prevented" and "removed after the fact".

## 3. Graceful intervention ladder

Interventions escalate; the pipeline always prefers the least-disruptive action
that contains the harm.

| Level | Action                                                             | Trigger                                                        |
| ----- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| 1     | **Label / age-gate** the stream                                    | rising but ambiguous risk                                      |
| 2     | **Segment cut** — drop the offending buffered segment              | a discrete in-buffer violation                                 |
| 3     | **Audio/video mute** of a span                                     | sustained but recoverable issue                                |
| 4     | **Suspend to operator** — stream paused, routed to a human console | high risk, needs judgment                                      |
| 5     | **End the stream**                                                 | S0/S1 confirmed harm; broadcaster unresponsive to lower levels |

Levels 1–3 are reversible and proportionate; levels 4–5 always generate an
explanation to the broadcaster and an appeal path. Emergency S0 (credible
imminent violence, child-safety) jumps straight to level 5 plus the escalation
path in [moderation-pipelines.md](moderation-pipelines.md) §5.

## 4. Audience-side abuse

The broadcaster is not the only risk surface.

- **Chat abuse** — per-message L1/L2 on live chat; trust-aware rate limiting
  ([risk-intelligence.md](risk-intelligence.md)) throttles low-trust accounts in
  hot rooms before a human must intervene.
- **Raid detection** — a sudden influx of accounts with shared signals (creation
  cohort, follow graph, behavior lock-step) arriving at one stream is detected as
  a coordinated event and triggers protective mode: heightened chat friction,
  slow mode, and an operator alert. Legitimate organic surges are distinguished
  by graph diversity — a real audience is graph-diverse; a raid is not.
- **Coordinated spam** — lock-step identical/near-identical chat messages are
  collapsed and rate-limited at L1.
- **Clip abuse** — clips minted from a live stream inherit the stream's risk
  state; a clip cut from a segment later found violating is invalidated when the
  parent segment is. Clip creation by low-trust accounts during an elevated-risk
  window carries extra review.

## 5. The live operator console

Human operators are first-class in live. The **live control console** (a
back-office surface, not built in this phase) gives operators: the delayed
feed, the live risk timeline, chat, the intervention ladder, and one-click
escalation. Operator actions are themselves logged and auditable.

Priority for operator attention = `live_risk × concurrent_viewers`. A
high-risk stream with 5 viewers and a moderate-risk stream with 500k viewers are
triaged by _reach-weighted_ risk.

## 6. Sub-second budget

| Stage                                             | Budget                              |
| ------------------------------------------------- | ----------------------------------- |
| Frame/audio sample → L1                           | < 100 ms                            |
| L1 → L2 streaming inference                       | < 400 ms                            |
| L2 → L3 live risk update                          | < 100 ms                            |
| Total detection within the broadcast-delay window | comfortably inside the delay buffer |

If the AI tier is degraded, live **fails safe toward friction** — shorter delay
buffers are extended, low-trust chat is throttled harder, new low-trust streams
get tighter limits — rather than failing open.

## 7. Live moderation events

| Event                              | Producer                 | Consumers                         |
| ---------------------------------- | ------------------------ | --------------------------------- |
| `moderation.live.risk_changed.v1`  | live pipeline            | operator console, observability   |
| `moderation.live.intervention.v1`  | live pipeline / operator | enforcement, trust-service, audit |
| `moderation.live.raid_detected.v1` | risk-intelligence        | live pipeline, operator console   |

Stream: `moderation.events.v1` ([ADR 0036](../adr/0036-event-topology.md)).

## Related documents

- [moderation-pipelines.md](moderation-pipelines.md) · [risk-intelligence.md](risk-intelligence.md) · [platform-governance.md](platform-governance.md)
