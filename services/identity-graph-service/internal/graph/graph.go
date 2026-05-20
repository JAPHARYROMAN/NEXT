// Package graph is an in-memory, concurrency-safe adjacency store.
//
// Phase 6: in-memory is enough to ship the gRPC contract and let consumers
// integrate. Phase 8 swaps the backing store for Neo4j (per ADR 0023) behind
// the same Graph interface — callers don't change.
package graph

import (
	"sync"
)

// edgeKey identifies one directed, typed edge.
type edgeKey struct {
	from string
	kind string
}

// Neighbor is one outbound edge target with its weight.
type Neighbor struct {
	UserID string
	Weight float64
}

// Graph holds typed, weighted, directed edges in memory.
type Graph struct {
	mu  sync.RWMutex
	adj map[edgeKey]map[string]float64
}

// New returns an empty graph.
func New() *Graph {
	return &Graph{adj: make(map[edgeKey]map[string]float64)}
}

// UpsertEdge inserts or updates a (from)-[kind]->(to) edge with the given weight.
func (g *Graph) UpsertEdge(from, to, kind string, weight float64) {
	g.mu.Lock()
	defer g.mu.Unlock()
	k := edgeKey{from: from, kind: kind}
	if g.adj[k] == nil {
		g.adj[k] = make(map[string]float64)
	}
	g.adj[k][to] = weight
}

// Neighbors returns up to `limit` outbound neighbors of `user` along `kind`,
// highest weight first. limit ≤ 0 means no limit.
func (g *Graph) Neighbors(user, kind string, limit int) []Neighbor {
	g.mu.RLock()
	defer g.mu.RUnlock()
	out := neighborsLocked(g, user, kind)
	// simple selection: sort by weight desc
	for i := 0; i < len(out); i++ {
		for j := i + 1; j < len(out); j++ {
			if out[j].Weight > out[i].Weight {
				out[i], out[j] = out[j], out[i]
			}
		}
	}
	if limit > 0 && len(out) > limit {
		out = out[:limit]
	}
	return out
}

func neighborsLocked(g *Graph, user, kind string) []Neighbor {
	targets := g.adj[edgeKey{from: user, kind: kind}]
	out := make([]Neighbor, 0, len(targets))
	for to, w := range targets {
		out = append(out, Neighbor{UserID: to, Weight: w})
	}
	return out
}

// Path runs a bounded breadth-first search for any path from `from` to `to`
// along `kind` edges within `maxHops`. Returns the hop list (inclusive of both
// endpoints) and whether a path was found.
func (g *Graph) Path(from, to, kind string, maxHops int) ([]string, bool) {
	g.mu.RLock()
	defer g.mu.RUnlock()

	if from == to {
		return []string{from}, true
	}
	if maxHops <= 0 {
		maxHops = 4
	}

	type node struct {
		id   string
		path []string
	}
	visited := map[string]bool{from: true}
	queue := []node{{id: from, path: []string{from}}}

	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		if len(cur.path)-1 >= maxHops {
			continue
		}
		for _, n := range neighborsLocked(g, cur.id, kind) {
			if visited[n.UserID] {
				continue
			}
			next := append(append([]string{}, cur.path...), n.UserID)
			if n.UserID == to {
				return next, true
			}
			visited[n.UserID] = true
			queue = append(queue, node{id: n.UserID, path: next})
		}
	}
	return nil, false
}
