// Discovery-mode inference, candidate-source budgets, and MMR diversity
// selection. The TypeScript reference for the logic the Go services implement
// on the serving path — shared so clients and tests reason about it identically.

import type { CandidateSource, DiscoveryMode, SessionSignals } from '@next/feed-types';

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/**
 * Infer the exploration-appetite scalar in [0,1] from session signals.
 * 0 = pure exploit (Precision), 1 = pure surprise (Chaos).
 *
 * A high skip rate raises appetite — when the model's confident guesses are
 * wrong, the right move is to widen the aperture, not narrow it. This is the
 * deliberate inversion of a watch-time optimizer.
 */
export function appetiteFromSignals(s: SessionSignals): number {
  const lengthPush = clamp01(s.sessionLengthMs / (30 * 60 * 1000)); // ramps over 30 min
  const skipPush = clamp01(s.skipRate);
  const dwellPush = clamp01(s.dwellVariance);
  const stalenessPush = clamp01(s.msSinceNovelEngagement / (10 * 60 * 1000));
  const fatiguePush = clamp01(s.fatigue);

  const rewatchPull = clamp01(s.rewatchCount / 5); // pulls toward Precision
  const searchPull = s.searchDrivenEntry ? 1 : 0;

  const towardChaos =
    0.22 * lengthPush +
    0.28 * skipPush +
    0.18 * dwellPush +
    0.16 * stalenessPush +
    0.16 * fatiguePush;

  const towardPrecision = 0.6 * rewatchPull + 0.4 * searchPull;

  return clamp01(towardChaos - 0.45 * towardPrecision + 0.15);
}

/** Map the continuous appetite scalar onto the three named mode anchors. */
export function modeFromAppetite(appetite: number): DiscoveryMode {
  const a = clamp01(appetite);
  if (a < 0.34) return 'precision';
  if (a < 0.67) return 'discovery';
  return 'chaos';
}

/**
 * Smooth the appetite scalar across requests (EWMA) so a single skip cannot
 * whiplash the feed. `smoothing` is the weight of the new reading.
 */
export function smoothAppetite(previous: number, next: number, smoothing = 0.3): number {
  return clamp01(previous * (1 - smoothing) + next * smoothing);
}

const PRECISION_BUDGET: Record<CandidateSource, number> = {
  collaborative: 0.2,
  semantic: 0.21,
  creator_affinity: 0.19,
  community_affinity: 0.13,
  trending: 0.12,
  long_tail: 0.05,
  fresh: 0.05,
  serendipity: 0.05,
};

const CHAOS_BUDGET: Record<CandidateSource, number> = {
  collaborative: 0.06,
  semantic: 0.14,
  creator_affinity: 0.06,
  community_affinity: 0.12,
  trending: 0.12,
  long_tail: 0.2,
  fresh: 0.15,
  serendipity: 0.15,
};

const SOURCES = Object.keys(PRECISION_BUDGET) as CandidateSource[];

/**
 * Candidate-source budgets (fractions summing to ~1) for a given appetite,
 * interpolated between the Precision and Chaos profiles. The long-tail, fresh,
 * and serendipity sources are never zero — the structural exploration guarantee.
 */
export function sourceBudgets(appetite: number): Record<CandidateSource, number> {
  const out = {} as Record<CandidateSource, number>;
  for (const src of SOURCES) {
    out[src] = lerp(PRECISION_BUDGET[src], CHAOS_BUDGET[src], appetite);
  }
  return out;
}

/**
 * The stage-4 novelty weight: how much the final rerank favors novelty over
 * relevance. Rises with appetite.
 */
export function noveltyWeight(appetite: number): number {
  return lerp(0.2, 0.8, appetite);
}

/**
 * Greedy Maximal Marginal Relevance selection. Picks `k` items maximizing
 *   lambda * relevance - (1 - lambda) * maxSimilarityToAlreadyPicked.
 *
 * `lambda` is mode-dependent: high in Precision (favor relevance), low in Chaos
 * (favor spread). This is the generic core of stage-3 diversity balancing.
 */
export function mmrSelect<T>(
  items: readonly T[],
  k: number,
  relevanceOf: (item: T) => number,
  similarityOf: (a: T, b: T) => number,
  lambda: number,
): T[] {
  const remaining = [...items];
  const picked: T[] = [];
  const limit = Math.min(k, remaining.length);

  while (picked.length < limit) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      let maxSim = 0;
      for (const p of picked) {
        const sim = similarityOf(candidate, p);
        if (sim > maxSim) maxSim = sim;
      }
      const score = lambda * relevanceOf(candidate) - (1 - lambda) * maxSim;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    picked.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }
  return picked;
}

/** The MMR lambda for a mode — relevance weight in the MMR objective. */
export function mmrLambda(mode: DiscoveryMode): number {
  switch (mode) {
    case 'precision':
      return 0.8;
    case 'discovery':
      return 0.6;
    case 'chaos':
      return 0.35;
  }
}
