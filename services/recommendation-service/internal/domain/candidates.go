package domain

import "math"

// Source is a candidate recall source. Every candidate carries the source(s)
// that produced it; sources have different priors and exploration character.
type Source string

const (
	SourceCollaborative     Source = "collaborative"
	SourceSemantic          Source = "semantic"
	SourceCreatorAffinity   Source = "creator_affinity"
	SourceCommunityAffinity Source = "community_affinity"
	SourceTrending          Source = "trending"
	SourceLongTail          Source = "long_tail"
	SourceFresh             Source = "fresh"
	SourceSerendipity       Source = "serendipity"
)

// explorationSources are the sources that count toward the exploration floor.
var explorationSources = map[Source]bool{
	SourceLongTail:    true,
	SourceFresh:       true,
	SourceSerendipity: true,
}

// sourcePrior is a coarse quality/relevance prior per source, used by the
// lightweight (stage 1) scorer before any semantic signal is available.
var sourcePrior = map[Source]float64{
	SourceCollaborative:     0.80,
	SourceSemantic:          0.78,
	SourceCreatorAffinity:   0.82,
	SourceCommunityAffinity: 0.62,
	SourceTrending:          0.58,
	SourceLongTail:          0.40,
	SourceFresh:             0.42,
	SourceSerendipity:       0.35,
}

// Candidate is a content item before ranking, carrying scalar features. Heavy
// semantic scoring belongs to the Rust ranker; this funnel reasons over these.
type Candidate struct {
	ContentID       string
	CreatorID       string
	Sources         []Source
	PopularityPrior float64 // [0,1]
	AgeHours        float64
	Affinity        float64 // [0,1] creator/interest affinity to this user
	Topic           string
	Aesthetic       string // aesthetic-cluster id
	Intensity       float64 // [0,1] emotional energy
}

// bestSourcePrior returns the strongest source prior among a candidate's
// sources — the candidate is as good as its best reason to be here.
func (c Candidate) bestSourcePrior() float64 {
	best := 0.0
	for _, s := range c.Sources {
		if p := sourcePrior[s]; p > best {
			best = p
		}
	}
	return best
}

// isExplorationSourced reports whether the candidate's sources make it count
// toward the exploration floor.
func (c Candidate) isExplorationSourced() bool {
	for _, s := range c.Sources {
		if explorationSources[s] {
			return true
		}
	}
	return false
}

// SourceBudgets returns candidate-source budgets (fractions ~summing to 1) for
// an appetite, interpolated between the Precision and Chaos profiles. The
// long-tail, fresh, and serendipity sources are never zero — the structural
// exploration guarantee (architecture.md invariant 1).
func SourceBudgets(appetite float64) map[Source]float64 {
	precision := map[Source]float64{
		SourceCollaborative:     0.20,
		SourceSemantic:          0.21,
		SourceCreatorAffinity:   0.19,
		SourceCommunityAffinity: 0.13,
		SourceTrending:          0.12,
		SourceLongTail:          0.05,
		SourceFresh:             0.05,
		SourceSerendipity:       0.05,
	}
	chaos := map[Source]float64{
		SourceCollaborative:     0.06,
		SourceSemantic:          0.14,
		SourceCreatorAffinity:   0.06,
		SourceCommunityAffinity: 0.12,
		SourceTrending:          0.12,
		SourceLongTail:          0.20,
		SourceFresh:             0.15,
		SourceSerendipity:       0.15,
	}
	out := make(map[Source]float64, len(precision))
	for src, p := range precision {
		out[src] = lerp(p, chaos[src], appetite)
	}
	return out
}

// recencyKernel multiplies a score so stale content counts for less — but
// never zero: the floor keeps the long tail reachable.
func recencyKernel(ageHours float64) float64 {
	const halfLife, floor = 72.0, 0.2
	if ageHours < 0 {
		ageHours = 0
	}
	decay := math.Exp2(-ageHours / halfLife)
	return floor + (1-floor)*decay
}
