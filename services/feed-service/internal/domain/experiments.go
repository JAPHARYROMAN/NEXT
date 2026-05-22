package domain

import "hash/fnv"

// HoldoutBuckets is the bucket count for the permanent global holdout; bucket 0
// is the holdout. ~1% of users receive the frozen baseline ranker for
// long-horizon measurement (see docs/recommendation/experimentation.md).
const HoldoutBuckets = 100

// bucket hashes a string into [0, n). FNV-1a is stable across processes and
// releases, so an assignment is sticky for the life of the experiment.
func bucket(key string, n uint32) uint32 {
	if n == 0 {
		return 0
	}
	h := fnv.New32a()
	_, _ = h.Write([]byte(key))
	return h.Sum32() % n
}

// AssignArm deterministically assigns a user to an experiment arm. The same
// (user, experiment) always maps to the same arm — assignment is sticky across
// sessions and devices without needing to be stored first.
func AssignArm(userID, experimentKey string, arms []string) string {
	if len(arms) == 0 {
		return ""
	}
	return arms[bucket(experimentKey+":"+userID, uint32(len(arms)))]
}

// IsHoldout reports whether a user is in the permanent global holdout. The
// holdout is keyed on user id alone, so a user is held out (or not) uniformly
// across every experiment.
func IsHoldout(userID string) bool {
	return bucket("holdout:"+userID, HoldoutBuckets) == 0
}
