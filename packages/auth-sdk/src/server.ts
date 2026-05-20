import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { z } from 'zod';

const ClaimsSchema = z.object({
  sub: z.string(),
  iss: z.string(),
  aud: z.union([z.string(), z.array(z.string())]),
  exp: z.number().int(),
  iat: z.number().int(),
  scope: z.string().optional(),
  next: z
    .object({
      tier: z.enum(['anonymous', 'authenticated', 'creator', 'partner', 'staff']).optional(),
      org_id: z.string().optional(),
    })
    .optional(),
});

export type NextClaims = z.infer<typeof ClaimsSchema> & JWTPayload;

export interface VerifierConfig {
  readonly issuer: string;
  readonly audience: string | readonly string[];
  readonly jwksUri: string;
  readonly cooldownMs?: number;
  readonly cacheMaxAgeMs?: number;
}

export class JwtVerifier {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly config: VerifierConfig) {
    this.jwks = createRemoteJWKSet(new URL(config.jwksUri), {
      cooldownDuration: config.cooldownMs ?? 30_000,
      cacheMaxAge: config.cacheMaxAgeMs ?? 10 * 60_000,
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
