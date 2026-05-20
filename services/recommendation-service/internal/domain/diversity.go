package domain

import (
	"math"
	"sort"
)

// FairnessK is the strength of the popularity-offset bonus. A creator with
// near-zero exposure gets the full bonus; a mega-creator gets ~0. Calibrated so
// emerging creators compete on resonance, not incumbency (ADR 0031).
const FairnessK = 0.15

// MaxCreatorShare caps how much of a slate a single creator may occupy.
const MaxCreatorShare = 0.25

// FairnessOffset is the relevance bonus an item earns for its creator being
// under-exposed: k·(1 − popularity).
func FairnessOffset(popularityPrior float64) float64 {
	return FairnessK * (1 - clamp01(popularityPrior))
}

// candidateSimilarity is the blended distance used by MMR — how much two items
// would homogenize a slate if placed together. In [0,1].
func candidateSimilarity(a, b Scored) float64 {
	var sim float64
	if a.CreatorID == b.CreatorID {
		sim += 0.40
	}
	if a.Topic == b.Topic && a.Topic != "" {
		sim += 0.25
	}
	if a.Aesthetic == b.Aesthetic && a.Aesthetic != "" {
		sim += 0.20
	}
	// Pacing closeness — items of near-identical intensity flatten the feed.
	sim += 0.15 * (1 - math.Abs(a.Intensity-b.Intensity))
	return clamp01(sim)
}

// MMRSelect runs greedy Maximal Marginal Relevance: it picks up to k items
// maximizing lambda·relevance − (1−lambda)·maxSimilarityToPicked, while
// enforcing the per-creator cap. This is stage 3 — it shapes the slate.
//
// capBase sizes the per-creator cap (ceil(MaxCreatorShare·capBase)) — it is the
// final slate length, not the stage-3 working-set size k, so the 25% cap holds
// for the slate the user actually sees.
func MMRSelect(items []Scored, k, capBase int, lambda float64) []Scored {
	if k > len(items) {
		k = len(items)
	}
	if k <= 0 {
		return nil
	}
	maxPerCreator := int(math.Ceil(MaxCreatorShare * float64(capBase)))
	if maxPerCreator < 1 {
		maxPerCreator = 1
	}

	remaining := make([]Scored, len(items))
	copy(remaining, items)
	picked := make([]Scored, 0, k)
	creatorCount := make(map[string]int)

	for len(picked) < k && len(remaining) > 0 {
		bestIdx := -1
		bestScore := math.Inf(-1)
		for i, c := range remaining {
			if creatorCount[c.CreatorID] >= maxPerCreator {
				continue // creator cap — skip, do not select
			}
			maxSim := 0.0
			for _, p := range picked {
				if s := candidateSimilarity(c, p); s > maxSim {
					maxSim = s
				}
			}
			score := lambda*c.Relevance - (1-lambda)*maxSim
			if score > bestScore {
				bestScore = score
				bestIdx = i
			}
		}
		if bestIdx < 0 {
			break // every remaining candidate is creator-capped
		}
		chosen := remaining[bestIdx]
		chosen.DiversityMargin = bestScore
		picked = append(picked, chosen)
		creatorCount[chosen.CreatorID]++
		remaining = append(remaining[:bestIdx], remaining[bestIdx+1:]...)
	}
	return picked
}

// Metrics is the measured health of a slate, checked against guardrails.
type Metrics struct {
	ExplorationShare float64
	CreatorGini      float64
	TopicEntropy     float64
	DistinctCreators int
	MaxCreatorShare  float64
}

// SlateMetrics computes the diversity + fairness measurements of a slate.
func SlateMetrics(items []Scored) Metrics {
	n := len(items)
	if n == 0 {
		return Metrics{}
	}

	explorationCount := 0
	creatorCount := make(map[string]int)
	topicCount := make(map[string]int)
	for _, it := range items {
		if it.Exploration {
			explorationCount++
		}
		creatorCount[it.CreatorID]++
		topicCount[it.Topic]++
	}

	maxCreator := 0
	for _, c := range creatorCount {
		if c > maxCreator {
			maxCreator = c
		}
	}

	return Metrics{
		ExplorationShare: float64(explorationCount) / float64(n),
		CreatorGini:      gini(creatorCount),
		TopicEntropy:     entropy(topicCount, n),
		DistinctCreators: len(creatorCount),
		MaxCreatorShare:  float64(maxCreator) / float64(n),
	}
}

// gini is the Gini coefficient over per-creator impression counts: 0 = every
// creator served equally, →1 = one creator monopolizes the slate.
func gini(counts map[string]int) float64 {
	if len(counts) < 2 {
		return 0
	}
	values := make([]int, 0, len(counts))
	total := 0
	for _, c := range counts {
		values = append(values, c)
		total += c
	}
	if total == 0 {
		return 0
	}
	sort.Ints(values)
	var weighted float64
	for i, v := range values {
		weighted += float64((i+1)*v)
	}
	n := float64(len(values))
	return (2*weighted)/(n*float64(total)) - (n+1)/n
}

// entropy is the Shannon entropy of the topic distribution, normalized to
// [0,1] so it is comparable across slates of different size.
func entropy(counts map[string]int, total int) float64 {
	if total == 0 || len(counts) < 2 {
		return 0
	}
	var h float64
	for _, c := range counts {
		if c == 0 {
			continue
		}
		p := float64(c) / float64(total)
		h -= p * math.Log2(p)
	}
	return h / math.Log2(float64(len(counts)))
}
