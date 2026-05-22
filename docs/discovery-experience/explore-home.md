# Explore Home

Discovery landing extending Phase 11 explore work.

## Route

- `/explore` — `ExploreHome` feature

## Packages

- `@next/explore-ui` — ExploreHero, LiveNowShelf, TopicPortals, ExperimentalShelf, EmergingCreatorsShelf, ChaosEntry
- `@next/discovery-ui` — DiscoveryWaves, SemanticExplorer, CreatorConstellation
- `@next/layout-engine` — ExploreLayout (waves sidebar + content)

## Sections

1. Hero with search entry
2. Community rail
3. Live now horizontal shelf
4. Topic portals
5. Semantic topic explorer
6. Rising creators
7. Experimental media shelf
8. Creator constellation
9. Chaos entry point
10. Adaptive feed

## Extension note

Replaces inline `DiscoveryExperience` composition — reuses existing discovery-ui primitives without duplication.

## Telemetry

`shelf_engagement`, `chaos_entry`, `discovery_engagement`
