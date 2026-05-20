package domain

import "testing"

func TestPageFatigue_RisesOverASkipHeavySession(t *testing.T) {
	f := 0.0
	for page := 0; page < 8; page++ {
		f = PageFatigue(f, 0.8, 0.7) // intense pages, lots of skipping
	}
	if !ShouldBreathe(f) {
		t.Fatalf("a long intense skip-heavy session should trigger breathe, fatigue=%.3f", f)
	}
}

func TestPageFatigue_StaysCalmOnLightSessions(t *testing.T) {
	f := 0.0
	for page := 0; page < 5; page++ {
		f = PageFatigue(f, 0.2, 0.05) // calm pages, little skipping
	}
	if ShouldBreathe(f) {
		t.Fatalf("a calm session should not trigger breathe, fatigue=%.3f", f)
	}
}

func TestPageFatigue_Bounded(t *testing.T) {
	f := 0.0
	for i := 0; i < 100; i++ {
		f = PageFatigue(f, 1, 1)
	}
	if f < 0 || f > 1 {
		t.Fatalf("fatigue must stay in [0,1], got %v", f)
	}
}

func TestOverstimulated(t *testing.T) {
	loud := make([]RankedItem, 6)
	for i := range loud {
		loud[i] = RankedItem{Intensity: 0.95}
	}
	if !Overstimulated(loud) {
		t.Fatalf("a uniformly loud page should read as overstimulated")
	}

	varied := []RankedItem{
		{Intensity: 0.9}, {Intensity: 0.2}, {Intensity: 0.7},
		{Intensity: 0.3}, {Intensity: 0.95}, {Intensity: 0.4},
	}
	if Overstimulated(varied) {
		t.Fatalf("a page with intensity variance should not read as overstimulated")
	}
}

func TestAvgIntensity(t *testing.T) {
	got := AvgIntensity([]RankedItem{{Intensity: 0.2}, {Intensity: 0.8}})
	if got < 0.49 || got > 0.51 {
		t.Fatalf("avg intensity = %v, want ~0.5", got)
	}
}
