package domain

import "sort"

// Scored is a candidate carried through the ranking funnel. The score
// breakdown is retained for replay and for "why was I shown this".
type Scored struct {
	Candidate
	Relevance       float64 // stage 2 — resonance
	Novelty         float64 // stage 2 — distance from established taste, [0,1]
	DiversityMargin float64 // stage 3 — MMR margin at selection
	FinalScore      float64 // stage 4 — the value the slate is ordered by
	Exploration     bool    // injected / sourced to satisfy the exploration floor
	Position        uint32  // stage 4 — final served position
}

// Funnel cut sizes. For small candidate sets these are no-ops; at scale they
// keep expensive stages off the bulk of the recall set.
const (
	stage1Keep = 500
	stage2Keep = 200
	stage3Keep = 80
)

// ExplorationFloor is the minimum exploration share of any served slate
// (architecture.md invariant 1). Enforced in stage 4.
const ExplorationFloor = 0.15

// Request is the input to the recommendation funnel.
type Request struct {
	Candidates   []Candidate
	Signals      SessionSignals
	Limit        int
	AppetiteHint float64 // <0 = unset; otherwise nudges inferred appetite
}

// Result is a served slate plus the context that produced it.
type Result struct {
	Mode                Mode
	Appetite            float64
	Items               []Scored
	Metrics             Metrics
	ExplorationInjected int
}

// Recommend runs the full four-stage funnel:
//
//	stage 0  apply mode inference
//	stage 1  lightweight ranking         (cheap scorer, keep top)
//	stage 2  semantic ranking            (relevance + novelty)
//	stage 3  diversity balancing         (fairness offset + MMR + creator cap)
//	stage 4  final rerank                (mode weighting, pacing, exploration floor)
func Recommend(req Request) Result {
	appetite := AppetiteFromSignals(req.Signals)
	if req.AppetiteHint >= 0 {
		// A surface hint is averaged in, not obeyed outright.
		appetite = clamp01((appetite + clamp01(req.AppetiteHint)) / 2)
	}
	mode := ModeFromAppetite(appetite)

	limit := req.Limit
	if limit <= 0 {
		limit = 24
	}
	stage1 := stageLightweight(req.Candidates)
	stage2 := stageSemantic(stage1)
	stage3 := stageDiversity(stage2, mode, limit)
	items, injected := stageRerank(stage3, appetite, limit)

	return Result{
		Mode:                mode,
		Appetite:            appetite,
		Items:               items,
		Metrics:             SlateMetrics(items),
		ExplorationInjected: injected,
	}
}

// stageLightweight is the cheap scorer: shallow features only, no semantics.
func stageLightweight(candidates []Candidate) []Scored {
	scored := make([]Scored, 0, len(candidates))
	for _, c := range candidates {
		light := 0.5*clamp01(c.Affinity) +
			0.3*c.bestSourcePrior() +
			0.2*recencyKernel(c.AgeHours)
		scored = append(scored, Scored{Candidate: c, Relevance: light})
	}
	sort.SliceStable(scored, func(i, j int) bool {
		return scored[i].Relevance > scored[j].Relevance
	})
	return truncate(scored, stage1Keep)
}

// stageSemantic computes relevance (resonance) and novelty (distance from
// established taste). The Rust cross-encoder replaces this at scale; the
// scalar-feature version here keeps the funnel self-contained and testable.
func stageSemantic(in []Scored) []Scored {
	for i := range in {
		c := in[i].Candidate
		in[i].Relevance = 0.55*clamp01(c.Affinity) +
			0.30*c.bestSourcePrior() +
			0.15*recencyKernel(c.AgeHours)

		exploreSourced := 0.0
		if c.isExplorationSourced() {
			exploreSourced = 1.0
		}
		in[i].Novelty = clamp01(0.5*(1-clamp01(c.Affinity)) +
			0.3*exploreSourced +
			0.2*(1-clamp01(c.PopularityPrior)))
	}
	sort.SliceStable(in, func(i, j int) bool { return in[i].Relevance > in[j].Relevance })
	return truncate(in, stage2Keep)
}

// stageDiversity applies the creator-fairness offset, then MMR-selects a
// slate that is spread across creators, topics, aesthetics, and pacing. The
// per-creator cap is sized to the final slate length, not the working set.
func stageDiversity(in []Scored, mode Mode, limit int) []Scored {
	for i := range in {
		in[i].Relevance = clamp01(in[i].Relevance + FairnessOffset(in[i].PopularityPrior))
	}
	return MMRSelect(in, stage3Keep, limit, MMRLambda(mode))
}

// stageRerank orders the slate for the experience: mode-weighted final score,
// emotional pacing, and the exploration floor. Returns the slate and the count
// of exploration items injected to satisfy the floor.
func stageRerank(in []Scored, appetite float64, limit int) ([]Scored, int) {
	nw := NoveltyWeight(appetite)
	for i := range in {
		in[i].FinalScore = (1-nw)*in[i].Relevance + nw*in[i].Novelty
		in[i].Exploration = in[i].isExplorationSourced() || in[i].Novelty >= 0.6
	}
	sort.SliceStable(in, func(i, j int) bool { return in[i].FinalScore > in[j].FinalScore })

	slate, injected := enforceExplorationFloor(in, limit)
	slate = pacingReorder(slate)
	for i := range slate {
		slate[i].Position = uint32(i)
	}
	return slate, injected
}

// enforceExplorationFloor guarantees at least ExplorationFloor of the slate is
// exploration content. If the top-`limit` by score is short, it swaps the
// lowest-scoring non-exploration items for the highest-scoring exploration
// items that fell below the cut.
func enforceExplorationFloor(ranked []Scored, limit int) ([]Scored, int) {
	if limit > len(ranked) {
		limit = len(ranked)
	}
	if limit == 0 {
		return nil, 0
	}
	slate := make([]Scored, limit)
	copy(slate, ranked[:limit])

	need := int(float64(limit)*ExplorationFloor + 0.999) // ceil
	have := 0
	for _, s := range slate {
		if s.Exploration {
			have++
		}
	}
	injected := 0
	for have < need {
		// highest-scoring exploration item below the cut
		srcIdx := -1
		for i := limit; i < len(ranked); i++ {
			if ranked[i].Exploration {
				srcIdx = i
				break
			}
		}
		if srcIdx < 0 {
			break // no exploration content available to inject
		}
		// lowest-scoring non-exploration item in the slate
		dstIdx := -1
		for i := len(slate) - 1; i >= 0; i-- {
			if !slate[i].Exploration {
				dstIdx = i
				break
			}
		}
		if dstIdx < 0 {
			break
		}
		swapped := ranked[srcIdx]
		ranked[srcIdx] = slate[dstIdx]
		slate[dstIdx] = swapped
		have++
		injected++
	}
	return slate, injected
}

// pacingReorder breaks up long runs of same-intensity content so the feed
// breathes — it never lets three consecutive items share an intensity band.
func pacingReorder(slate []Scored) []Scored {
	if len(slate) < 3 {
		return slate
	}
	pool := make([]Scored, len(slate))
	copy(pool, slate)
	out := make([]Scored, 0, len(slate))

	for len(pool) > 0 {
		pick := 0
		if len(out) >= 2 {
			b1 := band(out[len(out)-1].Intensity)
			b2 := band(out[len(out)-2].Intensity)
			if b1 == b2 {
				// last two share a band — find a different-band item
				for i, c := range pool {
					if band(c.Intensity) != b1 {
						pick = i
						break
					}
				}
			}
		}
		out = append(out, pool[pick])
		pool = append(pool[:pick], pool[pick+1:]...)
	}
	return out
}

// band buckets intensity into low / mid / high for pacing.
func band(intensity float64) int {
	switch {
	case intensity < 0.34:
		return 0
	case intensity < 0.67:
		return 1
	default:
		return 2
	}
}

func truncate(s []Scored, n int) []Scored {
	if n < len(s) {
		return s[:n]
	}
	return s
}
