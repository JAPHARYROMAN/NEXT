// Package domain holds profile-service business types and rules.
package domain

import (
	"errors"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ErrInvalidHandle is returned when a handle violates the format rules.
var ErrInvalidHandle = errors.New("invalid handle")

// ErrSelfFollow is returned when a user tries to follow themselves.
var ErrSelfFollow = errors.New("cannot follow self")

// Tier mirrors profile.v1.Tier.
type Tier string

const (
	TierAuthenticated Tier = "authenticated"
	TierCreator       Tier = "creator"
	TierPartner       Tier = "partner"
	TierStaff         Tier = "staff"
)

var validTier = map[Tier]bool{
	TierAuthenticated: true,
	TierCreator:       true,
	TierPartner:       true,
	TierStaff:         true,
}

// IsValid reports whether t is one of the known tiers.
func (t Tier) IsValid() bool { return validTier[t] }

// Profile is the in-memory aggregate.
type Profile struct {
	UserID      uuid.UUID
	Handle      string
	DisplayName string
	Bio         string
	Tier        Tier
	Followers   int64
	Following   int64
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Handle rules: 3-30 chars, [a-z0-9_], starts with a letter.
// Stored as citext so case-insensitive uniqueness is enforced by the DB.
var handleRegex = regexp.MustCompile(`^[a-z][a-z0-9_]{2,29}$`)

// NormalizeHandle lowercases and trims; returns ErrInvalidHandle on bad input.
func NormalizeHandle(h string) (string, error) {
	n := strings.ToLower(strings.TrimSpace(h))
	if !handleRegex.MatchString(n) {
		return "", ErrInvalidHandle
	}
	return n, nil
}
