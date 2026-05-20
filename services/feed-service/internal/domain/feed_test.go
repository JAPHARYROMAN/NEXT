package domain

import (
	"strconv"
	"testing"
)

func ri(idN int) RankedItem {
	return RankedItem{
		ContentID: "content" + strconv.Itoa(idN),
		CreatorID: "creator" + strconv.Itoa(idN),
		Score:     1.0 / float64(idN+1),
		Intensity: 0.5,
	}
}

func TestCursorRoundTrip(t *testing.T) {
	for _, offset := range []int{0, 1, 24, 999} {
		if got := DecodeCursor(EncodeCursor(offset)); got != offset {
			t.Errorf("cursor round trip failed: %d -> %d", offset, got)
		}
	}
}

func TestDecodeCursor_MalformedRestartsFeed(t *testing.T) {
	if DecodeCursor("not-a-cursor!!") != 0 {
		t.Fatalf("a malformed cursor must restart the feed at offset 0, not error")
	}
}

func TestAssemblePage_Paginates(t *testing.T) {
	ranked := make([]RankedItem, 50)
	for i := range ranked {
		ranked[i] = ri(i)
	}
	first := AssemblePage(ranked, nil, 0, 20)
	if len(first.Items) != 20 || !first.HasMore {
		t.Fatalf("first page should have 20 items and more to come, got %d hasMore=%v",
			len(first.Items), first.HasMore)
	}
	if first.Items[0].Position != 0 || first.Items[19].Position != 19 {
		t.Fatalf("positions should be absolute within the feed")
	}
	second := AssemblePage(ranked, nil, DecodeCursor(first.NextCursor), 20)
	if second.Items[0].ContentID == first.Items[0].ContentID {
		t.Fatalf("second page must not repeat the first page")
	}
}

func TestAssemblePage_DedupsSeenContent(t *testing.T) {
	ranked := make([]RankedItem, 10)
	for i := range ranked {
		ranked[i] = ri(i)
	}
	seen := map[string]bool{"content0": true, "content1": true, "content2": true}
	page := AssemblePage(ranked, seen, 0, 20)
	if len(page.Items) != 7 {
		t.Fatalf("expected 7 items after dedup of 3 seen, got %d", len(page.Items))
	}
	for _, it := range page.Items {
		if seen[it.ContentID] {
			t.Fatalf("already-seen content %q leaked into the feed", it.ContentID)
		}
	}
}
