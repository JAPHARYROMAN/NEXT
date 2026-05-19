// Browser-side OAuth/OIDC client helpers (authorization code + PKCE).
// Used by apps/web and apps/studio. Mobile uses platform SDKs.

export interface OAuthConfig {
  readonly authority: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scopes: readonly string[];
}

export interface TokenSet {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number; // ms epoch
  readonly idToken?: string;
}

const STORAGE_KEY = 'next.auth.tokens';

export function loadTokens(): TokenSet | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenSet;
  } catch {
    return null;
  }
}

export function storeTokens(t: TokenSet): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

export function clearTokens(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isExpiring(t: TokenSet, windowMs = 60_000): boolean {
  return Date.now() + windowMs >= t.expiresAt;
}

export async function authorizeUrl(config: OAuthConfig, state: string, codeChallenge: string): Promise<string> {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${config.authority}/oauth/authorize?${params.toString()}`;
}
