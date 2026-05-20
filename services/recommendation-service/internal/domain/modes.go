// Package domain holds the recommendation funnel: discovery modes, candidate
// sources, the four ranking stages, diversity balancing, and slate metrics.
// It is pure and dependency-free — every function here is unit-tested and
// deterministic, so the funnel can be replayed exactly.
package domain

import "math"

// Mode is one of the three discovery-mode anchors on the exploration-appetite
// axis. See docs/recommendation/discovery-modes.md.
type Mode string

const (
	ModePrecision Mode = "precision"
	ModeDiscovery Mode = "discovery"
	ModeChaos     Mode = "chaos"
)

// SessionSignals are the per-session inputs to discovery-mode inference.
type SessionSignals struct {
	SessionLengthMs        int64
	SkipRate               float64 // [0,1]
	RewatchCount           int
	SearchDrivenEntry      bool
	DwellVariance          float64 // [0,1]
	MsSinceNovelEngagement int64
	Fatigue                float64 // [0,1]
}

func clamp01(x float64) float64 {
	return math.Min(1, math.Max(0, x))
}

func lerp(a, b, t float64) float64 {
	return a + (b-a)*clamp01(t)
}

// AppetiteFromSignals infers the exploration-appetite scalar in [0,1].
// 0 = pure exploit (Precision); 1 = pure surprise (Chaos).
//
// A high skip rate RAISES appetite: when the model's confident guesses are
// being rejected, the answer is to widen the aperture, not to double down.
// That inversion is what separates NEXT from a watch-time optimizer.
func AppetiteFromSignals(s SessionSignals) float64 {
	lengthPush := clamp01(float64(s.SessionLengthMs) / float64(30*60*1000))
	skipPush := clamp01(s.SkipRate)
	dwellPush := clamp01(s.DwellVariance)
	stalenessPush := clamp01(float64(s.MsSinceNovelEngagement) / float64(10*60*1000))
	fatiguePush := clamp01(s.Fatigue)

	rewatchPull := clamp01(float64(s.RewatchCount) / 5.0)
	searchPull := 0.0
	if s.SearchDrivenEntry {
		searchPull = 1.0
	}

	towardChaos := 0.22*lengthPush +
		0.28*skipPush +
		0.18*dwellPush +
		0.16*stalenessPush +
		0.16*fatiguePush

	towardPrecision := 0.6*rewatchPull + 0.4*searchPull

	return clamp01(towardChaos - 0.45*towardPrecision + 0.15)
}

// ModeFromAppetite maps the continuous appetite scalar onto a named anchor.
func ModeFromAppetite(appetite float64) Mode {
	a := clamp01(appetite)
	switch {
	case a < 0.34:
		return ModePrecision
	case a < 0.67:
		return ModeDiscovery
	default:
		return ModeChaos
	}
}

// SmoothAppetite EWMA-smooths appetite across requests so a single skip cannot
// whiplash the feed. smoothing is the weight of the new reading.
func SmoothAppetite(previous, next, smoothing float64) float64 {
	return clamp01(previous*(1-smoothing) + next*clamp01(smoothing))
}

// NoveltyWeight is the stage-4 weight on novelty vs. relevance; rises with
// appetite.
func NoveltyWeight(appetite float64) float64 {
	return lerp(0.2, 0.8, appetite)
}

// MMRLambda is the relevance weight in the stage-3 MMR objective: high in
// Precision (favor relevance), low in Chaos (favor spread).
func MMRLambda(mode Mode) float64 {
	switch mode {
	case ModePrecision:
		return 0.8
	case ModeChaos:
		return 0.35
	default:
		return 0.6
	}
}
