package domain

import "testing"

func TestFairnessOffset_FavorsTheUnderexposed(t *testing.T) {
	if FairnessOffset(0) != FairnessK {
		t.Fatalf("a zero-exposure creator should get the full bonus %v, got %v", FairnessK, FairnessOffset(0))
	}
	if FairnessOffset(1) != 0 {
		t.Fatalf("a maximally-exposed creator should get no bonus, got %v", FairnessOffset(1))
	}
	if FairnessOffset(0.5) <= 0 || FairnessOffset(0.5) >= FairnessK {
		t.Fatalf("mid-exposure bonus should be between 0 and k")
	}
}

func TestMMRSelect_EnforcesCreatorCap(t *testing.T) {
	// Ten candidates, all the same creator. The 25% cap on a 10-slate is 3.
	items := make([]Scored, 10)
	for i := range items {
		items[i] = Scored{
			Candidate: Candidate{ContentID: id("c", i), CreatorID: "solo"},
			Relevance: 0.9,
		}
	}
	got := MMRSelect(items, 10, 10, 0.6)
	if len(got) > 3 {
		t.Fatalf("creator cap breached: one creator filled %d of a 10-slate", len(got))
	}
}

func TestMMRSelect_SpreadsAcrossCreators(t *testing.T) {
	// Six creators, four items each. A 12-slate must draw from many creators.
	items := make([]Scored, 0, 24)
	for c := 0; c < 6; c++ {
		for i := 0; i < 4; i++ {
			items = append(items, Scored{
				Candidate: Candidate{
					ContentID: id("c", c*4+i),
					CreatorID: id("creator", c),
					Topic:     id("topic", c),
				},
				Relevance: 0.8,
			})
		}
	}
	got := MMRSelect(items, 80, 12, 0.6)
	seen := map[string]bool{}
	for _, s := range got {
		seen[s.CreatorID] = true
	}
	if len(seen) < 4 {
		t.Fatalf("expected a spread across creators, only saw %d", len(seen))
	}
}

func TestSlateMetrics(t *testing.T) {
	slate := []Scored{
		{Candidate: Candidate{CreatorID: "a", Topic: "x"}, Exploration: true},
		{Candidate: Candidate{CreatorID: "a", Topic: "y"}},
		{Candidate: Candidate{CreatorID: "b", Topic: "x"}, Exploration: true},
		{Candidate: Candidate{CreatorID: "c", Topic: "z"}},
	}
	m := SlateMetrics(slate)
	if m.ExplorationShare != 0.5 {
		t.Errorf("exploration share = %v, want 0.5", m.ExplorationShare)
	}
	if m.DistinctCreators != 3 {
		t.Errorf("distinct creators = %v, want 3", m.DistinctCreators)
	}
	if m.MaxCreatorShare != 0.5 {
		t.Errorf("max creator share = %v, want 0.5", m.MaxCreatorShare)
	}
	if m.CreatorGini <= 0 {
		t.Errorf("an uneven slate should have a positive Gini, got %v", m.CreatorGini)
	}
}

func TestSlateMetrics_EmptyIsZero(t *testing.T) {
	if (SlateMetrics(nil) != Metrics{}) {
		t.Fatalf("metrics of an empty slate must be the zero value")
	}
}
