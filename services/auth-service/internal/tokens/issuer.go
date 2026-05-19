// Package tokens issues RS256 JWTs and publishes the JWKS that verifiers cache.
//
// Phase 5 uses an in-memory RSA keypair generated at boot — sufficient for local
// dev and CI. Production swaps the Signer for one backed by Vault Transit (per
// ADR 0010), but the public Issuer + JWKSHandler interfaces stay the same.
package tokens

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Config controls token issuance.
type Config struct {
	Issuer       string        // iss claim (https://auth.next.local)
	Audience     string        // aud claim (next-api)
	AccessTTL    time.Duration // 15 min default
	Tier         string        // claim under next.tier; defaults to authenticated
}

// Claims are the payload of every NEXT access token.
type Claims struct {
	jwt.RegisteredClaims
	Next NextClaim `json:"next"`
}

// NextClaim is the platform-specific claim namespace.
type NextClaim struct {
	Tier   string `json:"tier"`
	Handle string `json:"handle,omitempty"`
	OrgID  string `json:"org_id,omitempty"`
}

// Issuer mints access tokens. Safe for concurrent use.
type Issuer struct {
	cfg Config
	mu  sync.RWMutex
	kid string
	key *rsa.PrivateKey
}

// NewIssuer generates a fresh RSA keypair and returns an Issuer.
// Keys are 2048-bit — adequate for RS256 and what every standard advises.
func NewIssuer(cfg Config) (*Issuer, error) {
	if cfg.AccessTTL == 0 {
		cfg.AccessTTL = 15 * time.Minute
	}
	if cfg.Tier == "" {
		cfg.Tier = "authenticated"
	}
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, fmt.Errorf("generate rsa: %w", err)
	}
	return &Issuer{
		cfg: cfg,
		kid: keyID(&priv.PublicKey),
		key: priv,
	}, nil
}

// Mint produces a signed access token for `subject` with optional handle.
func (i *Issuer) Mint(subject, handle string) (token string, expiresAt time.Time, err error) {
	i.mu.RLock()
	defer i.mu.RUnlock()
	now := time.Now().UTC()
	expiresAt = now.Add(i.cfg.AccessTTL)

	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    i.cfg.Issuer,
			Subject:   subject,
			Audience:  jwt.ClaimStrings{i.cfg.Audience},
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now.Add(-30 * time.Second)),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			ID:        randomTokenID(),
		},
		Next: NextClaim{Tier: i.cfg.Tier, Handle: handle},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	t.Header["kid"] = i.kid
	signed, err := t.SignedString(i.key)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("sign: %w", err)
	}
	return signed, expiresAt, nil
}

// JWKS returns the JWK Set containing the current public key, in the format
// every JWT verifier expects.
func (i *Issuer) JWKS() ([]byte, error) {
	i.mu.RLock()
	defer i.mu.RUnlock()
	jwk := publicJWK(&i.key.PublicKey, i.kid)
	return json.Marshal(struct {
		Keys []map[string]string `json:"keys"`
	}{Keys: []map[string]string{jwk}})
}

// JWKSHandler returns an http.Handler that serves the JWKS at /.well-known/jwks.json.
// Sets Cache-Control to match the verifier's cache TTL (10 minutes by default).
func (i *Issuer) JWKSHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		body, err := i.JWKS()
		if err != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "public, max-age=600")
		_, _ = w.Write(body)
	})
}

// Issuer returns the configured iss claim — needed by the OIDC discovery doc.
func (i *Issuer) IssuerName() string { return i.cfg.Issuer }

// Audience returns the audience name used in the aud claim.
func (i *Issuer) Audience() string { return i.cfg.Audience }

// JWKSPath is the canonical mount path for the JWKS handler.
const JWKSPath = "/.well-known/jwks.json"

// ----- helpers -------------------------------------------------------------

func publicJWK(pub *rsa.PublicKey, kid string) map[string]string {
	return map[string]string{
		"kty": "RSA",
		"use": "sig",
		"alg": "RS256",
		"kid": kid,
		"n":   base64.RawURLEncoding.EncodeToString(pub.N.Bytes()),
		"e":   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(pub.E)).Bytes()),
	}
}

// keyID is a stable, short identifier derived from the public key fingerprint.
// Clients use it to pick the right JWK when keys rotate.
func keyID(pub *rsa.PublicKey) string {
	der, _ := x509.MarshalPKIXPublicKey(pub)
	sum := sha256.Sum256(der)
	return base64.RawURLEncoding.EncodeToString(sum[:8])
}

func randomTokenID() string {
	var buf [16]byte
	_, _ = rand.Read(buf[:])
	return base64.RawURLEncoding.EncodeToString(buf[:])
}
