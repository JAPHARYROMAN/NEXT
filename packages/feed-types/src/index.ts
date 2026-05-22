// Shared types for the NEXT recommendation + discovery domain.
// The single TypeScript source of truth for feed shapes; backend contracts
// live in proto (services/*/proto) and the topic catalog (@next/events).

/** The three discovery-mode anchors on the continuous exploration-appetite axis. */
export type DiscoveryMode = 'precision' | 'discovery' | 'chaos';

/** Where a feed is rendered. Each surface has its own blend + pacing profile. */
export type FeedSurface = 'home' | 'watch_next' | 'explore' | 'chaos' | 'creator' | 'live';

/** A recall source — every candidate carries the source(s) that produced it. */
export type CandidateSource =
  | 'collaborative'
  | 'semantic'
  | 'creator_affinity'
  | 'community_affinity'
  | 'trending'
  | 'long_tail'
  | 'fresh'
  | 'serendipity';

/** The six axes diversity balancing spreads a slate across. */
export type DiversityAxis = 'creator' | 'topic' | 'aesthetic' | 'pacing' | 'format' | 'exposure';

/** A content item before ranking — output of candidate generation. */
export interface Candidate {
  readonly contentId: string;
  readonly creatorId: string;
  readonly sources: readonly CandidateSource[];
  /** Coarse popularity prior in [0,1]; used by the fairness offset. */
  readonly popularityPrior: number;
  /** Age of the content in hours; feeds the recency kernel. */
  readonly ageHours: number;
}

/** A candidate after the full ranking funnel. The score breakdown is replayable. */
export interface ScoredCandidate extends Candidate {
  /** Stage 2 — resonance with who the user is + what they're doing. */
  readonly relevance: number;
  /** Stage 2 — distance from what the user has already seen, in [0,1]. */
  readonly novelty: number;
  /** Stage 3 — the MMR margin at the moment this item was selected. */
  readonly diversityMargin: number;
  /** Stage 4 — the value the slate was finally ordered by. */
  readonly finalScore: number;
  /** True when injected to satisfy the exploration floor. */
  readonly exploration: boolean;
}

/** One rendered feed entry. */
export interface FeedItem {
  readonly contentId: string;
  readonly creatorId: string;
  readonly position: number;
  readonly score: number;
  readonly exploration: boolean;
}

/** A page of feed, cursor-paginated. */
export interface FeedPage {
  readonly surface: FeedSurface;
  readonly mode: DiscoveryMode;
  readonly items: readonly FeedItem[];
  readonly nextCursor: string | null;
  readonly diversity: DiversityMetrics;
}

/** The measured health of a feed page — checked against experiment guardrails. */
export interface DiversityMetrics {
  /** Fraction of items that are exploration; guardrail floor is 0.15. */
  readonly explorationShare: number;
  /** Creator Gini coefficient over the page; 0 = fair, 1 = monopoly. */
  readonly creatorGini: number;
  /** Shannon entropy of the topic distribution. */
  readonly topicEntropy: number;
  readonly distinctCreators: number;
  /** Largest single-creator fraction; hard cap is 0.25. */
  readonly maxCreatorShare: number;
}

/** Session signals that drive discovery-mode inference. */
export interface SessionSignals {
  readonly sessionLengthMs: number;
  /** Recent skip rate in [0,1]. */
  readonly skipRate: number;
  readonly rewatchCount: number;
  readonly searchDrivenEntry: boolean;
  /** Variance of dwell time across the session; high = exploratory. */
  readonly dwellVariance: number;
  /** Milliseconds since the last engagement the model considered novel. */
  readonly msSinceNovelEngagement: number;
  /** Fatigue score in [0,1] from the pacing model. */
  readonly fatigue: number;
}

/** A request for a feed page. */
export interface FeedRequest {
  readonly userId: string;
  readonly sessionId: string;
  readonly surface: FeedSurface;
  readonly cursor?: string;
  readonly limit?: number;
}

/** Guardrail thresholds — encode the architecture invariants. */
export const GUARDRAILS = {
  /** Minimum exploration share of any served slate. */
  minExplorationShare: 0.15,
  /** Maximum fraction of a session slate a single creator may occupy. */
  maxCreatorShare: 0.25,
  /** Maximum fraction of a slate a single aesthetic cluster may occupy. */
  maxAestheticShare: 0.4,
} as const;
