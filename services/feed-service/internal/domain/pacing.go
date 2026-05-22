package domain

import "math"

// BreatheThreshold is the fatigue level above which the feed should serve a
// calmer next page rather than escalating intensity.
const BreatheThreshold = 0.6

func clamp01(x float64) float64 {
	return math.Min(1, math.Max(0, x))
}

// AvgIntensity is the mean emotional intensity of a page.
func AvgIntensity(items []RankedItem) float64 {
	if len(items) == 0 {
		return 0
	}
	var sum float64
	for _, it := range items {
		sum += clamp01(it.Intensity)
	}
	return sum / float64(len(items))
}

// PageFatigue advances the session fatigue score after serving a page.
//
// Fatigue decays each page (prev*0.85) but is pushed up by intense pages, by
// skipping, and by a small per-page drift. It is the inverse of exploration
// readiness — and, deliberately, the system's response to high fatigue is to
// calm down (see ShouldBreathe), never to escalate to recapture attention.
func PageFatigue(prev, avgIntensity, skipRate float64) float64 {
	return clamp01(prev*0.85 +
		0.18*clamp01(avgIntensity) +
		0.25*clamp01(skipRate) +
		0.05)
}

// ShouldBreathe reports whether the next page should be paced down.
func ShouldBreathe(fatigue float64) bool {
	return fatigue > BreatheThreshold
}

// Overstimulated reports intensity monotony — a page that is loud everywhere
// with no variation. A breathing feed has intensity variance; a feed that has
// flatlined at high intensity is the dopamine-ratchet failure mode.
func Overstimulated(items []RankedItem) bool {
	if len(items) < 4 {
		return false
	}
	mean := AvgIntensity(items)
	if mean < 0.66 {
		return false
	}
	var variance float64
	for _, it := range items {
		d := clamp01(it.Intensity) - mean
		variance += d * d
	}
	variance /= float64(len(items))
	return variance < 0.02
}
