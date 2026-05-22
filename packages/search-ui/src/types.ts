export type SearchIntent =
  | 'exact'
  | 'explore'
  | 'chaos'
  | 'learn'
  | 'creators'
  | 'communities'
  | 'live';

export type ResultLayout = 'mixed' | 'grouped' | 'compact' | 'immersive';

export interface SearchSuggestion {
  readonly id: string;
  readonly label: string;
  readonly intent?: SearchIntent;
}

export interface SearchResultMedia {
  readonly kind: 'media';
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly href: string;
  readonly hue?: number;
}

export interface SearchResultCreator {
  readonly kind: 'creator';
  readonly handle: string;
  readonly name: string;
  readonly bio?: string;
  readonly href: string;
  readonly live?: boolean;
}

export interface SearchResultCommunity {
  readonly kind: 'community';
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly memberCount: string;
  readonly href: string;
  readonly mood?: 'calm' | 'chaos' | 'learn';
}

export interface SearchResultLive {
  readonly kind: 'live';
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly viewerLabel: string;
  readonly href: string;
  readonly hue?: number;
}

export interface SearchResultTopic {
  readonly kind: 'topic';
  readonly id: string;
  readonly label: string;
  readonly relation: 'near' | 'far' | 'wild';
  readonly resultCount?: number;
}

export type SearchResultItem =
  | SearchResultMedia
  | SearchResultCreator
  | SearchResultCommunity
  | SearchResultLive
  | SearchResultTopic;

export interface SearchResultSection {
  readonly id: string;
  readonly title: string;
  readonly items: readonly SearchResultItem[];
}

export interface SearchFilters {
  readonly duration?: 'short' | 'medium' | 'long';
  readonly recency?: 'day' | 'week' | 'month' | 'any';
  readonly mood?: 'calm' | 'energetic' | 'experimental';
}
