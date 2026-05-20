// Package domain holds the media processing state machine.
package domain

import "errors"

// State is a video's position in the processing lifecycle.
// MEDIA_ARCHITECTURE §3: UPLOADING → UPLOADED → INGESTED → PROCESSING → READY → PUBLISHED, or FAILED.
type State string

const (
	StateUploading  State = "uploading"
	StateUploaded   State = "uploaded"
	StateIngested   State = "ingested"
	StateProcessing State = "processing"
	StateReady      State = "ready"
	StatePublished  State = "published"
	StateFailed     State = "failed"
)

// ErrInvalidTransition is returned when a state move is not allowed.
var ErrInvalidTransition = errors.New("invalid state transition")

// allowed maps each state to the states it may move to.
var allowed = map[State][]State{
	StateUploading:  {StateUploaded, StateFailed},
	StateUploaded:   {StateIngested, StateFailed},
	StateIngested:   {StateProcessing, StateFailed},
	StateProcessing: {StateReady, StateFailed},
	StateReady:      {StatePublished, StateProcessing, StateFailed},
	StatePublished:  {StateFailed},
	StateFailed:     {},
}

// CanTransition reports whether `from` may move to `to`.
func CanTransition(from, to State) bool {
	for _, s := range allowed[from] {
		if s == to {
			return true
		}
	}
	return false
}

// IsValidState reports whether s is a known state.
func IsValidState(s State) bool {
	_, ok := allowed[s]
	return ok
}
