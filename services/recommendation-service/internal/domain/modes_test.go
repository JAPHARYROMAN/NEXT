package domain

import "testing"

func TestAppetiteFromSignals_SkipsWidenTheAperture(t *testing.T) {
	calm := SessionSignals{SessionLengthMs: 2 * 60 * 1000, SkipRate: 0.05}
	skipping := SessionSignals{SessionLengthMs: 2 * 60 * 1000, SkipRate: 0.85}

	if AppetiteFromSignals(skipping) <= AppetiteFromSignals(calm) {
		t.Fatalf("a high skip rate must raise exploration appetite, not lower it: calm=%.3f skipping=%.3f",
			AppetiteFromSignals(calm), AppetiteFromSignals(skipping))
	}
}

func TestAppetiteFromSignals_SearchEntryFavorsPrecision(t *testing.T) {
	base := SessionSignals{SessionLengthMs: 5 * 60 * 1000, DwellVariance: 0.3}
	searched := base
	searched.SearchDrivenEntry = true

	if AppetiteFromSignals(searched) >= AppetiteFromSignals(base) {
		t.Fatalf("search-driven entry must pull toward precision")
	}
}

func TestAppetiteFromSignals_Bounded(t *testing.T) {
	extreme := SessionSignals{
		SessionLengthMs: 1 << 40, SkipRate: 5, DwellVariance: 5,
		MsSinceNovelEngagement: 1 << 40, Fatigue: 5,
	}
	a := AppetiteFromSignals(extreme)
	if a < 0 || a > 1 {
		t.Fatalf("appetite must stay in [0,1], got %v", a)
	}
}

func TestModeFromAppetite(t *testing.T) {
	cases := []struct {
		appetite float64
		want     Mode
	}{
		{0.0, ModePrecision},
		{0.2, ModePrecision},
		{0.5, ModeDiscovery},
		{0.7, ModeChaos},
		{1.0, ModeChaos},
	}
	for _, c := range cases {
		if got := ModeFromAppetite(c.appetite); got != c.want {
			t.Errorf("ModeFromAppetite(%v) = %v, want %v", c.appetite, got, c.want)
		}
	}
}

func TestSmoothAppetite_DampensSpikes(t *testing.T) {
	// A single spike from 0.2 to 1.0 must not move the smoothed value all the way.
	smoothed := SmoothAppetite(0.2, 1.0, 0.3)
	if smoothed >= 1.0 || smoothed <= 0.2 {
		t.Fatalf("smoothing must dampen the spike, got %v", smoothed)
	}
}

func TestNoveltyWeightRisesWithAppetite(t *testing.T) {
	if NoveltyWeight(0.9) <= NoveltyWeight(0.1) {
		t.Fatalf("novelty weight must rise with appetite")
	}
}

func TestMMRLambda_PrecisionFavorsRelevance(t *testing.T) {
	if MMRLambda(ModePrecision) <= MMRLambda(ModeChaos) {
		t.Fatalf("precision must weight relevance more than chaos does")
	}
}
