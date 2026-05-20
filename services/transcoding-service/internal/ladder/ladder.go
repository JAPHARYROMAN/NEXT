// Package ladder builds the content-adaptive bitrate ladder (ADR 0025).
package ladder

// Rung is one encoded variant.
type Rung struct {
	Name        string `json:"name"`
	Width       int32  `json:"width"`
	Height      int32  `json:"height"`
	Codec       string `json:"codec"`
	BitrateKbps int32  `json:"bitrate_kbps"`
}

// full is the default 6-rung ladder from MEDIA_ARCHITECTURE §5.
var full = []Rung{
	{Name: "360p", Width: 640, Height: 360, Codec: "h264", BitrateKbps: 800},
	{Name: "480p", Width: 854, Height: 480, Codec: "h264", BitrateKbps: 1400},
	{Name: "720p", Width: 1280, Height: 720, Codec: "h264", BitrateKbps: 3000},
	{Name: "1080p", Width: 1920, Height: 1080, Codec: "av1", BitrateKbps: 6000},
	{Name: "1440p", Width: 2560, Height: 1440, Codec: "av1", BitrateKbps: 12000},
	{Name: "2160p", Width: 3840, Height: 2160, Codec: "av1", BitrateKbps: 24000},
}

// For returns the content-adaptive ladder for a source of the given height:
// rungs taller than the source are dropped (no upscaling). Always keeps at
// least the lowest rung so every video has a playable variant.
func For(sourceHeight int32) []Rung {
	out := make([]Rung, 0, len(full))
	for _, r := range full {
		if r.Height <= sourceHeight {
			out = append(out, r)
		}
	}
	if len(out) == 0 {
		out = append(out, full[0])
	}
	return out
}
