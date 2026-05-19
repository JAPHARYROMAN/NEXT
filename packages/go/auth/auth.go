// Package auth provides JWT verification with JWKS caching for NEXT Go services.
// Matches the contract in [ADR 0012] — RS256, 15-min access tokens, weekly rotation.
package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
)

// Tier is the access tier embedded in the `next.tier` claim.
type Tier string

const (
	TierAnonymous     Tier = "anonymous"
	TierAuthenticated Tier = "authenticated"
	TierCreator       Tier = "creator"
	TierPartner       Tier = "partner"
	TierStaff         Tier = "staff"
)

// Claims is the typed subset of fields we use from a NEXT JWT.
type Claims struct {
	Subject  string `json:"sub"`
	Tier     Tier   `json:"-"`
	OrgID    string `json:"-"`
	Scope    string `json:"scope,omitempty"`
	jwt.RegisteredClaims
	NextNamespace map[string]any `json:"next,omitempty"`
}

// Verifier verifies tokens against a cached JWKS.
type Verifier struct {
	issuer   string
	audience string
	jwks     keyfunc.Keyfunc
}

// New constructs a Verifier. The JWKS at jwksURI is cached and refreshed automatically.
func New(ctx context.Context, issuer, audience, jwksURI string) (*Verifier, error) {
	k, err := keyfunc.NewDefaultCtx(ctx, []string{jwksURI})
	if err != nil {
		return nil, fmt.Errorf("jwks: %w", err)
	}
	return &Verifier{issuer: issuer, audience: audience, jwks: k}, nil
}

// Verify parses and validates the token. Returns the typed Claims.
func (v *Verifier) Verify(tokenString string) (*Claims, error) {
	c := &Claims{}
	tok, err := jwt.ParseWithClaims(tokenString, c, v.jwks.Keyfunc,
		jwt.WithIssuer(v.issuer),
		jwt.WithAudience(v.audience),
		jwt.WithValidMethods([]string{"RS256"}),
		jwt.WithLeeway(30*time.Second),
	)
	if err != nil {
		return nil, fmt.Errorf("verify: %w", err)
	}
	if !tok.Valid {
		return nil, errors.New("invalid token")
	}
	if next, ok := c.NextNamespace["tier"].(string); ok {
		c.Tier = Tier(next)
	}
	if org, ok := c.NextNamespace["org_id"].(string); ok {
		c.OrgID = org
	}
	return c, nil
}
