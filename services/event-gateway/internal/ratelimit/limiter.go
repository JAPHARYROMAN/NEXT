package ratelimit

import (
	"sync"
	"time"
)

type Limiter struct {
	mu        sync.Mutex
	rate      float64
	burst     float64
	buckets   map[string]*bucket
	now       func() time.Time
	lastPrune time.Time
}

type bucket struct {
	tokens float64
	last   time.Time
}

func New(perMinute int, burst int) *Limiter {
	if perMinute <= 0 {
		perMinute = 60
	}
	if burst <= 0 {
		burst = perMinute
	}
	now := time.Now
	return &Limiter{
		rate:      float64(perMinute) / 60,
		burst:     float64(burst),
		buckets:   map[string]*bucket{},
		now:       now,
		lastPrune: now(),
	}
}

func (l *Limiter) Allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.now()
	if now.Sub(l.lastPrune) > 10*time.Minute {
		for id, b := range l.buckets {
			if now.Sub(b.last) > 30*time.Minute {
				delete(l.buckets, id)
			}
		}
		l.lastPrune = now
	}

	b := l.buckets[key]
	if b == nil {
		l.buckets[key] = &bucket{tokens: l.burst - 1, last: now}
		return true
	}

	elapsed := now.Sub(b.last).Seconds()
	b.tokens += elapsed * l.rate
	if b.tokens > l.burst {
		b.tokens = l.burst
	}
	b.last = now
	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}
