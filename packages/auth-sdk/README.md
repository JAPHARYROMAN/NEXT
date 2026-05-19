# @next/auth-sdk

Auth helpers per [ADR 0012](../../docs/adr/0012-authentication.md).

- `@next/auth-sdk/server` — `JwtVerifier` with JWKS caching + RS256 + rotation tolerance.
- `@next/auth-sdk/client` — browser OAuth2 + PKCE helpers for web/studio.

Mobile uses platform SDKs (ASWebAuthenticationSession on iOS, Custom Tabs on Android).
