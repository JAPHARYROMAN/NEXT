// Package saga holds the pipeline stage definitions + completion rules.
// MEDIA_ARCHITECTURE §3 + ADR 0028: transcode is required; the rest are best-effort.
package saga

// Stages is the full pipeline fan-out, in dispatch order.
var Stages = []string{"transcode", "thumbnail", "subtitle", "understand", "index"}

// requiredStages gate a run reaching `completed`. Best-effort stages
// (thumbnail, subtitle, understand, index) do not block completion.
var requiredStages = map[string]bool{"transcode": true}

// IsRequired reports whether a stage gates run completion.
func IsRequired(stage string) bool { return requiredStages[stage] }

// IsKnown reports whether a stage name is part of the pipeline.
func IsKnown(stage string) bool {
	for _, s := range Stages {
		if s == stage {
			return true
		}
	}
	return false
}

// StageState is one stage's status within a run.
type StageState struct {
	Stage    string
	Status   string // pending | running | succeeded | failed
	Attempts int
	Detail   string
}

// Outcome summarises where a run stands given its stage states.
type Outcome struct {
	Complete bool // every required stage succeeded
	Failed   bool // a required stage failed
}

// Evaluate decides the run outcome from the current stage states.
func Evaluate(stages []StageState) Outcome {
	requiredSucceeded := 0
	requiredTotal := 0
	for _, s := range stages {
		if !IsRequired(s.Stage) {
			continue
		}
		requiredTotal++
		switch s.Status {
		case "succeeded":
			requiredSucceeded++
		case "failed":
			return Outcome{Failed: true}
		}
	}
	return Outcome{Complete: requiredTotal > 0 && requiredSucceeded == requiredTotal}
}
