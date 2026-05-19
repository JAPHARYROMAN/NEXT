// Package authz verifies the inbound Authorization: Bearer JWT against auth-service's
// JWKS and injects the verified claims into the request context.
//
// Verification is *optional*: requests without a token are allowed through and
// arrive as anonymous. Mutation resolvers requiring identity must check
// ClaimsFromContext themselves and return Unauthenticated when needed.
package authz

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
)

// Claims captures the parsed JWT payload.
type Claims struct {
	Subject  string
	Tier     string
	Handle   string
	IssuedAt time.Time
	Expires  time.Time
}

type ctxKey int

const claimsKey ctxKey = 1

// ClaimsFromContext returns the verified claims, or nil if the request was anonymous.
func ClaimsFromContext(ctx context.Context) *Claims {
	v := ctx.Value(claimsKey)
	if v == nil {
		return nil
	}
	c, _ := v.(*Claims)
	return c
}

// Config controls verification.
type Config struct {
	Issuer   string
	Audience string
	JWKSURI  string
}

// New constructs the HTTP middleware. The JWKS is fetched lazily; if the URI is
// unreachable on first request, the request continues as anonymous (logged at warn).
func New(cfg Config) (func(http.Handler) http.Handler, error) {
	k, err := keyfunc.NewDefaultCtx(context.Background(), []string{cfg.JWKSURI})
	if err != nil {
		return nil, err
	}
	parser := jwt.NewParser(
		jwt.WithIssuer(cfg.Issuer),
		jwt.WithAudience(cfg.Audience),
		jwt.WithValidMethods([]string{"RS256"}),
		jwt.WithLeeway(30*time.Second),
	)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := bearerFromHeader(r.Header.Get("Authorization"))
			if token == "" {
				next.ServeHTTP(w, r)
				return
			}

			parsed, err := parser.Parse(token, k.Keyfunc)
			if err != nil || !parsed.Valid {
				// Invalid token. We don't reject the request here — let
				// individual resolvers decide. But we do log so abuse leaves a trail.
				slog.WarnContext(r.Context(), "jwt verify failed",
					"err", strOrEmpty(err), "remote_ip", r.RemoteAddr)
				next.ServeHTTP(w, r)
				return
			}

			c, ok := claimsFromToken(parsed)
			if !ok {
				next.ServeHTTP(w, r)
				return
			}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), claimsKey, c)))
		})
	}, nil
}

func bearerFromHeader(h string) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(h, prefix) {
		return ""
	}
	return strings.TrimSpace(h[len(prefix):])
}

func claimsFromToken(t *jwt.Token) (*Claims, bool) {
	mc, ok := t.Claims.(jwt.MapClaims)
	if !ok {
		return nil, false
	}
	c := &Claims{Subject: stringClaim(mc, "sub")}
	if iat, ok := mc["iat"].(float64); ok {
		c.IssuedAt = time.Unix(int64(iat), 0).UTC()
	}
	if exp, ok := mc["exp"].(float64); ok {
		c.Expires = time.Unix(int64(exp), 0).UTC()
	}
	if next, ok := mc["next"].(map[string]any); ok {
		c.Tier = stringClaim(next, "tier")
		c.Handle = stringClaim(next, "handle")
	}
	return c, c.Subject != ""
}

func stringClaim(m map[string]any, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func strOrEmpty(err error) string {
	if errors.Is(err, nil) || err == nil {
		return ""
	}
	return err.Error()
}
