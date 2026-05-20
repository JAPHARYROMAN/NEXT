package domain

import (
	"strconv"
	"testing"
)

func TestAssignArm_IsSticky(t *testing.T) {
	arms := []string{"control", "treatment"}
	first := AssignArm("user-123", "ranking-exp-1", arms)
	for i := 0; i < 100; i++ {
		if AssignArm("user-123", "ranking-exp-1", arms) != first {
			t.Fatalf("assignment must be sticky for the same user + experiment")
		}
	}
}

func TestAssignArm_DiffersByExperiment(t *testing.T) {
	arms := []string{"a", "b", "c", "d"}
	// The same user keyed into different experiments should not be perfectly
	// correlated — sample a few experiments and expect at least two arms.
	seen := map[string]bool{}
	for i := 0; i < 20; i++ {
		seen[AssignArm("user-xyz", "exp-"+strconv.Itoa(i), arms)] = true
	}
	if len(seen) < 2 {
		t.Fatalf("expected assignment to vary across experiments, saw %d arms", len(seen))
	}
}

func TestAssignArm_EmptyArms(t *testing.T) {
	if AssignArm("user", "exp", nil) != "" {
		t.Fatalf("no arms should yield an empty assignment")
	}
}

func TestAssignArm_RoughlyBalanced(t *testing.T) {
	arms := []string{"control", "treatment"}
	counts := map[string]int{}
	for i := 0; i < 2000; i++ {
		counts[AssignArm("user-"+strconv.Itoa(i), "balance-exp", arms)]++
	}
	// A fair hash should not put more than 65% of users in one arm.
	for arm, c := range counts {
		if c > 1300 {
			t.Fatalf("arm %q got %d/2000 — assignment is not balanced", arm, c)
		}
	}
}

func TestIsHoldout_SmallAndStable(t *testing.T) {
	held := 0
	for i := 0; i < 5000; i++ {
		u := "user-" + strconv.Itoa(i)
		if IsHoldout(u) {
			held++
			if !IsHoldout(u) {
				t.Fatalf("holdout membership must be stable")
			}
		}
	}
	// ~1% expected; allow a wide band so the test is not flaky.
	if held == 0 || held > 250 {
		t.Fatalf("holdout share looks wrong: %d/5000", held)
	}
}
