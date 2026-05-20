// Package scopes is the Go-side mirror of @next/permissions. The PDP resolves
// a (tier, scope) pair against these defaults before consulting role bindings.
package scopes

// TierDefaults is the floor scope set per tier. Role bindings add to this.
var TierDefaults = map[string][]string{
	"anonymous":     {"profile:read"},
	"authenticated": {"profile:read", "profile:write_self", "social:follow", "payment:tip"},
	"creator": {
		"profile:read", "profile:write_self", "social:follow", "payment:tip",
		"video:upload", "video:publish", "video:delete_self",
		"live:start", "live:end", "payment:payout_self",
	},
	"partner": {
		"profile:read", "profile:write_self", "social:follow", "payment:tip",
		"video:upload", "video:publish", "video:delete_self",
		"live:start", "live:end", "payment:payout_self",
	},
	"staff": {
		"profile:read", "profile:write_self", "profile:write_any", "social:follow",
		"video:upload", "video:publish", "video:delete_self", "video:delete_any",
		"live:start", "live:end", "payment:tip", "payment:payout_self", "payment:payout_any",
		"moderation:view", "moderation:decide", "admin:impersonate", "admin:feature_flag",
	},
}

// TierGrants reports whether the tier's default set includes scope.
func TierGrants(tier, scope string) bool {
	for _, s := range TierDefaults[tier] {
		if s == scope {
			return true
		}
	}
	return false
}
