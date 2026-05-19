import type { Scope } from '@next/permissions';
import { DefaultScopesByTier } from '@next/permissions';
import type { Tier } from '@next/identity-types';

export interface AuthorizeInput {
  readonly subjectId: string;
  readonly subjectTier: Tier;
  readonly scope: Scope;
  /** Resource identifier (`video:<id>`, `user:<id>`, etc.). */
  readonly resource?: string;
  /** Free-form context for ABAC rules. */
  readonly context?: Record<string, unknown>;
}

export interface AuthorizeDecision {
  readonly allow: boolean;
  readonly reason: string;
  /** When true the decision was made locally without contacting the PDP. */
  readonly local: boolean;
}

export interface RemotePDP {
  authorize(input: AuthorizeInput): Promise<AuthorizeDecision>;
}

/**
 * Local-first authorize: checks the tier's default scope set in-process.
 * For anything the local check can't decide cleanly, defers to the remote PDP.
 *
 * Phase 5: the remote PDP is optional — locally is enough for the scopes we
 * have today. Phase 6+ wires in the real PDP for ABAC rules.
 */
export async function authorize(
  input: AuthorizeInput,
  remote?: RemotePDP,
): Promise<AuthorizeDecision> {
  const tierScopes = DefaultScopesByTier[input.subjectTier];
  if (tierScopes.includes(input.scope)) {
    return { allow: true, reason: `tier:${input.subjectTier}`, local: true };
  }
  if (remote) {
    return remote.authorize(input);
  }
  return { allow: false, reason: 'tier_lacks_scope', local: true };
}
