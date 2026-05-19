// Relay-style cursor pagination — used by every GraphQL connection and gRPC list endpoint.

export interface PageInfo {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor: string | null;
  readonly endCursor: string | null;
}

export interface Edge<T> {
  readonly cursor: string;
  readonly node: T;
}

export interface Connection<T> {
  readonly edges: readonly Edge<T>[];
  readonly pageInfo: PageInfo;
  readonly totalCount?: number;
}

export interface PaginationArgs {
  readonly first?: number;
  readonly after?: string;
  readonly last?: number;
  readonly before?: string;
}

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 25;
