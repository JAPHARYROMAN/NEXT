// Package blob stores upload chunks. The dev implementation writes parts to the
// local filesystem; production swaps in S3 multipart behind the same Store
// interface (per MEDIA_ARCHITECTURE §4 — disk parts ≈ S3 parts).
package blob

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

// Store persists upload chunks and assembles them on finalize.
type Store struct {
	root string
}

// NewStore roots the store at `root`, creating it if absent.
func NewStore(root string) (*Store, error) {
	if err := os.MkdirAll(root, 0o755); err != nil {
		return nil, fmt.Errorf("mkdir blob root: %w", err)
	}
	return &Store{root: root}, nil
}

func (s *Store) sessionDir(sessionID string) string {
	return filepath.Join(s.root, "sessions", sessionID)
}

// PutChunk writes one chunk at the given byte offset for a session.
func (s *Store) PutChunk(sessionID string, offset int64, data []byte) error {
	dir := s.sessionDir(sessionID)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("mkdir session dir: %w", err)
	}
	name := filepath.Join(dir, fmt.Sprintf("%020d.part", offset))
	if err := os.WriteFile(name, data, 0o644); err != nil {
		return fmt.Errorf("write chunk: %w", err)
	}
	return nil
}

// Assemble concatenates a session's parts in offset order into a single object
// under objects/, returns the object key, and drops the part directory.
func (s *Store) Assemble(sessionID string) (objectKey string, totalBytes int64, err error) {
	dir := s.sessionDir(sessionID)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return "", 0, fmt.Errorf("read session dir: %w", err)
	}
	parts := make([]string, 0, len(entries))
	for _, e := range entries {
		if strings.HasSuffix(e.Name(), ".part") {
			parts = append(parts, e.Name())
		}
	}
	sort.Strings(parts) // zero-padded offsets sort lexically == numerically

	objectsDir := filepath.Join(s.root, "objects")
	if err := os.MkdirAll(objectsDir, 0o755); err != nil {
		return "", 0, fmt.Errorf("mkdir objects: %w", err)
	}
	objectKey = filepath.Join("objects", sessionID+".bin")
	out, err := os.Create(filepath.Join(s.root, objectKey))
	if err != nil {
		return "", 0, fmt.Errorf("create object: %w", err)
	}
	defer func() { _ = out.Close() }()

	var nextOffset int64
	for _, part := range parts {
		offset, perr := strconv.ParseInt(strings.TrimSuffix(part, ".part"), 10, 64)
		if perr != nil {
			return "", 0, fmt.Errorf("bad part name %q: %w", part, perr)
		}
		if offset != nextOffset {
			return "", 0, fmt.Errorf("gap before offset %d (expected %d)", offset, nextOffset)
		}
		f, oerr := os.Open(filepath.Join(dir, part))
		if oerr != nil {
			return "", 0, fmt.Errorf("open part: %w", oerr)
		}
		n, cerr := io.Copy(out, f)
		_ = f.Close()
		if cerr != nil {
			return "", 0, fmt.Errorf("copy part: %w", cerr)
		}
		nextOffset += n
	}
	totalBytes = nextOffset
	_ = os.RemoveAll(dir) // parts no longer needed
	return objectKey, totalBytes, nil
}
