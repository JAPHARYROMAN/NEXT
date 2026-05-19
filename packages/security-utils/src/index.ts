// Tiny crypto/security helpers. No big deps — everything here is platform-native.

/**
 * Constant-time equality on UTF-8 strings. Use for comparing tokens, codes,
 * fingerprints — anywhere a timing oracle would leak.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Cryptographically random base64url-encoded token of the requested byte length.
 * Works in browsers + Node ≥ 19 via the WebCrypto global.
 */
export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return base64UrlEncode(buf);
}

/**
 * SHA-256 of the given string, hex-encoded. Async because WebCrypto is async.
 */
export async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** RFC 4648 §5 base64url (no padding). */
export function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 =
    typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

/** PKCE verifier (43-128 chars of unreserved chars). 64 raw bytes → 86 char b64url. */
export function pkceVerifier(): string {
  return randomToken(64);
}

/** PKCE challenge: base64url(SHA256(verifier)). */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}
