package gateway

import (
	"sync"
	"time"
)

type MemoryIdempotencyStore struct {
	mu        sync.Mutex
	ttl       time.Duration
	entries   map[string]time.Time
	lastPrune time.Time
}

func NewMemoryIdempotencyStore(ttl time.Duration) *MemoryIdempotencyStore {
	now := time.Now().UTC()
	return &MemoryIdempotencyStore{
		ttl:       ttl,
		entries:   map[string]time.Time{},
		lastPrune: now,
	}
}

func (s *MemoryIdempotencyStore) SeenOrStore(key string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC()
	if now.Sub(s.lastPrune) > time.Minute {
		for existing, expiresAt := range s.entries {
			if now.After(expiresAt) {
				delete(s.entries, existing)
			}
		}
		s.lastPrune = now
	}

	if expiresAt, ok := s.entries[key]; ok && now.Before(expiresAt) {
		return true
	}
	s.entries[key] = now.Add(s.ttl)
	return false
}
