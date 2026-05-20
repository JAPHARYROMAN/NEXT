// Package domain holds feed orchestration: page assembly + dedup, cross-page
// emotional pacing, and deterministic experiment assignment. It is pure and
// dependency-free — every function here is unit-tested.
package domain

import (
	"encoding/base64"
	"strconv"
)

// RankedItem is an upstream-ranked candidate handed to feed orchestration.
type RankedItem struct {
	ContentID   string
	CreatorID   string
	Score       float64
	Exploration bool
	Intensity   float64 // [0,1] emotional energy
}

// FeedItem is one rendered feed entry.
type FeedItem struct {
	ContentID   string
	CreatorID   string
	Position    int
	Score       float64
	Exploration bool
}

// Page is an assembled feed page.
type Page struct {
	Items      []FeedItem
	NextCursor string
	HasMore    bool
}

// EncodeCursor turns a page offset into an opaque cursor string.
func EncodeCursor(offset int) string {
	return base64.RawURLEncoding.EncodeToString([]byte(strconv.Itoa(offset)))
}

// DecodeCursor parses a cursor back to an offset. An empty cursor is offset 0;
// a malformed cursor is treated as offset 0 rather than an error — a bad
// cursor should restart the feed, not break it.
func DecodeCursor(cursor string) int {
	if cursor == "" {
		return 0
	}
	raw, err := base64.RawURLEncoding.DecodeString(cursor)
	if err != nil {
		return 0
	}
	offset, err := strconv.Atoi(string(raw))
	if err != nil || offset < 0 {
		return 0
	}
	return offset
}

// AssemblePage deduplicates a ranked slate against content already seen this
// session, then returns the requested page. Cross-page dedup is what stops a
// feed from re-showing the same item on every scroll.
func AssemblePage(ranked []RankedItem, seen map[string]bool, offset, limit int) Page {
	if limit <= 0 {
		limit = 24
	}
	fresh := make([]RankedItem, 0, len(ranked))
	for _, it := range ranked {
		if !seen[it.ContentID] {
			fresh = append(fresh, it)
		}
	}
	if offset > len(fresh) {
		offset = len(fresh)
	}
	end := offset + limit
	if end > len(fresh) {
		end = len(fresh)
	}

	window := fresh[offset:end]
	items := make([]FeedItem, len(window))
	for i, it := range window {
		items[i] = FeedItem{
			ContentID:   it.ContentID,
			CreatorID:   it.CreatorID,
			Position:    offset + i,
			Score:       it.Score,
			Exploration: it.Exploration,
		}
	}
	hasMore := end < len(fresh)
	next := ""
	if hasMore {
		next = EncodeCursor(end)
	}
	return Page{Items: items, NextCursor: next, HasMore: hasMore}
}
