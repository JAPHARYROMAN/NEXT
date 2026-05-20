package domain

import (
	"strconv"
	"testing"
)

// id is a deterministic test-id helper, shared across the domain tests.
func id(prefix string, n int) string { return prefix + strconv.Itoa(n) }

func TestRecommend_EmptyCandidatesIsSafe(t *testing.T) {
	r := Recommend(Request{Limit: 12})
	if len(r.Items) != 0 {
		t.Fatalf("expected empty slate, got %d items", len(r.Items))
	}
}

func TestRecommend_HigherAffinityRanksHigher(t *testing.T) {
	candidates := []Candidate{
		{
			ContentID: "low", CreatorID: id("creator", 1),
			Sources: []Source{SourceCollaborative}, Affinity: 0.2,
			PopularityPrior: 0.5, Topic: "t", Aesthetic: "a", Intensity: 0.5,
		},
		{
			ContentID: "high", CreatorID: id("creator", 2),
			Sources: []Source{SourceCollaborative}, Affinity: 0.9,
			PopularityPrior: 0.5, Topic: "t", Aesthetic: "a", Intensity: 0.5,
		},
	}
	r := Recommend(Request{Candidates: candidates, Limit: 2})
	if len(r.Items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(r.Items))
	}
	if r.Items[0].ContentID != "high" {
		t.Fatalf("higher-affinity content should rank first, got %q", r.Items[0].ContentID)
	}
}

func TestRecommend_ExplorationFloorEnforced(t *testing.T) {
	var candidates []Candidate
	// 14 high-relevance, non-exploration items — each a distinct creator.
	for i := 0; i < 14; i++ {
		candidates = append(candidates, Candidate{
			ContentID: id("main", i), CreatorID: id("main-creator", i),
			Sources: []Source{SourceCollaborative}, Affinity: 0.9,
			PopularityPrior: 0.9, Topic: id("t", i%4), Intensity: 0.5,
		})
	}
	// 6 exploration-sourced items — low relevance, would fall below the cut.
	for i := 0; i < 6; i++ {
		candidates = append(candidates, Candidate{
			ContentID: id("explore", i), CreatorID: id("explore-creator", i),
			Sources: []Source{SourceSerendipity}, Affinity: 0.1,
			PopularityPrior: 0.05, Topic: id("nt", i), Intensity: 0.5,
		})
	}

	r := Recommend(Request{Candidates: candidates, Limit: 12})
	if r.Metrics.ExplorationShare < ExplorationFloor {
		t.Fatalf("exploration floor breached: share=%.3f floor=%.3f",
			r.Metrics.ExplorationShare, ExplorationFloor)
	}
	if r.ExplorationInjected == 0 {
		t.Fatalf("expected exploration injection when the natural slate under-explores")
	}
}

func TestRecommend_CreatorCapHeld(t *testing.T) {
	var candidates []Candidate
	// Six creators, four items each — a 12-slate must cap each at 25% (3).
	for c := 0; c < 6; c++ {
		for i := 0; i < 4; i++ {
			candidates = append(candidates, Candidate{
				ContentID:       id("c", c*4+i),
				CreatorID:       id("creator", c),
				Sources:         []Source{SourceCollaborative},
				Affinity:        0.8,
				PopularityPrior: 0.7,
				Topic:           id("t", c),
				Intensity:       0.5,
			})
		}
	}
	r := Recommend(Request{Candidates: candidates, Limit: 12})
	if r.Metrics.MaxCreatorShare > MaxCreatorShare+1e-9 {
		t.Fatalf("creator cap breached: max creator share=%.3f cap=%.3f",
			r.Metrics.MaxCreatorShare, MaxCreatorShare)
	}
}

func TestRecommend_ChaosAppetiteRaisesNovelty(t *testing.T) {
	var candidates []Candidate
	for i := 0; i < 30; i++ {
		src := SourceCollaborative
		if i%2 == 0 {
			src = SourceLongTail
		}
		candidates = append(candidates, Candidate{
			ContentID: id("c", i), CreatorID: id("creator", i),
			Sources: []Source{src}, Affinity: 0.5,
			PopularityPrior: 0.5, Topic: id("t", i%6), Intensity: float64(i%3) / 2,
		})
	}
	calm := Recommend(Request{
		Candidates: candidates, Limit: 12,
		Signals: SessionSignals{SearchDrivenEntry: true, RewatchCount: 4},
	})
	wild := Recommend(Request{
		Candidates: candidates, Limit: 12,
		Signals: SessionSignals{SkipRate: 0.9, SessionLengthMs: 40 * 60 * 1000, Fatigue: 0.8},
	})
	if wild.Appetite <= calm.Appetite {
		t.Fatalf("a skip-heavy long session should have higher appetite: calm=%.3f wild=%.3f",
			calm.Appetite, wild.Appetite)
	}
}
