// Client SDK for the NEXT recommendation domain. Thin, transport-agnostic:
// request/response shapes plus GraphQL operation documents the host executes.

import type { DiscoveryMode, DiversityMetrics, FeedItem, FeedSurface } from '@next/feed-types';

export type {
  Candidate,
  CandidateSource,
  DiscoveryMode,
  DiversityAxis,
  DiversityMetrics,
  FeedItem,
  FeedPage,
  FeedSurface,
  ScoredCandidate,
  SessionSignals,
} from '@next/feed-types';

/** Input for a recommendation request from a client surface. */
export interface RecommendationInput {
  readonly surface: FeedSurface;
  readonly cursor?: string;
  readonly limit?: number;
  /** Optional explicit nudge — e.g. an explore surface forcing higher appetite. */
  readonly appetiteHint?: number;
}

/** A served recommendation slate as the client receives it. */
export interface RecommendationResult {
  readonly surface: FeedSurface;
  readonly mode: DiscoveryMode;
  readonly items: readonly FeedItem[];
  readonly nextCursor: string | null;
  readonly diversity: DiversityMetrics;
  /** Server-assigned id; echo it back on impression/interaction events. */
  readonly slateId: string;
}

/** A client-side feedback signal, sent back so the session model can adapt. */
export type FeedbackKind = 'impression' | 'click' | 'skip' | 'complete' | 'hide';

export interface FeedbackInput {
  readonly slateId: string;
  readonly contentId: string;
  readonly kind: FeedbackKind;
  /** Dwell time in ms — distinguishes a real click from a fast bounce. */
  readonly dwellMs?: number;
}

/** GraphQL query document for fetching a recommendation slate. */
export const RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query Recommendations($input: RecommendationInput!) {
    recommendations(input: $input) {
      slateId
      surface
      mode
      nextCursor
      diversity {
        explorationShare
        creatorGini
        topicEntropy
        distinctCreators
        maxCreatorShare
      }
      items {
        contentId
        creatorId
        position
        score
        exploration
      }
    }
  }
`;

/** GraphQL mutation document for sending a feedback signal. */
export const FEEDBACK_MUTATION = /* GraphQL */ `
  mutation RecommendationFeedback($input: FeedbackInput!) {
    recommendationFeedback(input: $input) {
      accepted
    }
  }
`;

/** Build the variables object for a recommendation query. */
export function recommendationVariables(input: RecommendationInput): {
  input: RecommendationInput;
} {
  return { input: { limit: 24, ...input } };
}

/**
 * A served slate fails its guardrails if it under-explores or lets a single
 * creator dominate. Clients use this to surface a diagnostic in dev tooling;
 * the server enforces the same check authoritatively.
 */
export function violatesGuardrails(d: DiversityMetrics): boolean {
  return d.explorationShare < 0.15 || d.maxCreatorShare > 0.25;
}
