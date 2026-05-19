// Package domain holds auth-service business types and rules.
//
// Sessions in this service are the unit of "this user is logged in from this device
// right now." Each session has a stable family_id used for refresh-token theft detection
// per [docs/adr/0012-authentication.md].
package domain

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"time"

	"github.com/google/uuid"
)

// ErrSessionExpired is returned when a session is past its expires_at.
var ErrSessionExpired = errors.New("session expired")

// ErrSessionRevoked is returned for revoked sessions.
var ErrSessionRevoked = errors.New("session revoked")

// Tier matches the auth.v1.Tier enum in the proto.
type Tier string

const (
	TierAnonymous     Tier = "anonymous"
	TierAuthenticated Tier = "authenticated"
	TierCreator       Tier = "creator"
	TierPartner       Tier = "partner"
	TierStaff         Tier = "staff"
)

// Method is how a session was created.
type Method string

const (
	MethodPassword  Method = "password"
	MethodPasskey   Method = "passkey"
	MethodOAuth     Method = "oauth"
	MethodMagicLink Method = "magic_link"
	MethodRefresh   Method = "refresh"
)

// Session is the in-memory shape used by the API and store layers.
type Session struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	FamilyID   uuid.UUID
	Tier       Tier
	Method     Method
	ExpiresAt  time.Time
	RevokedAt  *time.Time
}

// IsActive returns true when the session is unrevoked and unexpired at `now`.
func (s Session) IsActive(now time.Time) error {
	if s.RevokedAt != nil {
		return ErrSessionRevoked
	}
	if now.After(s.ExpiresAt) {
		return ErrSessionExpired
	}
	return nil
}

// NewRefreshToken returns a fresh (raw, hash) pair. The raw token is given to the client;
// only the hash is stored.
func NewRefreshToken() (raw string, hash [32]byte, err error) {
	var buf [32]byte
	if _, err = rand.Read(buf[:]); err != nil {
		return "", [32]byte{}, err
	}
	raw = base64.RawURLEncoding.EncodeToString(buf[:])
	hash = sha256.Sum256(buf[:])
	return raw, hash, nil
}

// HashRefreshToken returns the canonical hash of a raw refresh token.
func HashRefreshToken(raw string) ([32]byte, error) {
	decoded, err := base64.RawURLEncoding.DecodeString(raw)
	if err != nil {
		return [32]byte{}, err
	}
	return sha256.Sum256(decoded), nil
}

// HashHex returns a hex-encoded hash, useful for logs (never the raw token).
func HashHex(h [32]byte) string { return hex.EncodeToString(h[:]) }
