export interface FlaggedMessage {
  readonly id: string;
  readonly author: string;
  readonly excerpt: string;
  readonly reason: string;
}

export interface MutedUser {
  readonly id: string;
  readonly handle: string;
  readonly until?: string;
}
