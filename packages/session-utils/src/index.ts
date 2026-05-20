import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { z } from 'zod';
import type { Tier } from '@next/identity-types';

const ClaimsSchema = z.object({
  sub: z.string().min(1),
  iss: z.string().min(1),
  aud: z.union([z.string(), z.array(z.string())]),
  exp: z.number().int(),
  iat: z.number().int(),
  sid: z.string().optional(),
  scope: z.string().optional(),
  next: z
    .object({
      tier: z.enum(['anonymous', 'authenticated', 'creator', 'partner', 'staff']).optional(),
      handle: z.string().optional(),
    })
    .optional(),
});

export type NextClaims = z.infer<typeof ClaimsSchema> & JWTPayload;

export interface VerifierConfig {
  readonly issuer: string;
  readonly audience: string | readonly string[];
  readonly jwksUri: string;
  readonly cacheMaxAgeMs?: number;
  readonly cooldownMs?: number;
}

export class JwtVerifier {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  constructor(private readonly config: VerifierConfig) {
    this.jwks = createRemoteJWKSet(new URL(config.jwksUri), {
      cacheMaxAge: config.cacheMaxAgeMs ?? 10 * 60_000,
      cooldownDuration: config.cooldownMs ?? 30_000,
    });
  }

  async verify(token: string): Promise<NextClaims> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.config.issuer,
      audience: Array.isArray(this.config.audience) ? this.config.audience : [this.config.audience],
      algorithms: ['RS256'],
      clockTolerance: 30,
    });
    return ClaimsSchema.parse(payload) as NextClaims;
  }
}

/** Extract a Bearer token from an `Authorization` header. Returns null when absent or malformed. */
export function bearerToken(header: string | null | undefined): string | null {
  if (!header) return null;
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) return null;
  const token = header.slice(prefix.length).trim();
  return token.length > 0 ? token : null;
}

/** Lightweight tier helper for UI components. */
export function tierOf(claims: NextClaims | null): Tier {
  return (claims?.next?.tier ?? 'anonymous') as Tier;
}
