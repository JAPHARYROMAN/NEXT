# TV Discovery Rails

TV discovery reuses `@next/discovery-ui` with TV-specific spacing and `TvShelf` horizontal rails.

## Rails on theater home

1. Continue watching
2. Live now
3. Creator spotlight
4. Watch parties

## Deep discovery (`/tv/discover`)

- `DiscoveryWaves` — cultural wave navigation
- `SemanticExplorer` — topic relations (near / far / wild)
- `CreatorConstellation` — adjacent creators by affinity

## Telemetry

- `trackDiscoveryEngagement('tv', …)`
- `trackTvShelfEngagement(shelf, action)`

## Philosophy

Supports constitution discovery triad: precision (continue), expansion (waves/semantic), chaos (separate Chaos TV surface).
