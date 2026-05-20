// Vector math for NEXT recommendation embeddings.
// Pure, dependency-free functions — safe to run on the request hot path.

/** A dense embedding vector. */
export type Vector = readonly number[];

function assertSameDim(a: Vector, b: Vector): void {
  if (a.length !== b.length) {
    throw new Error(`vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
}

/** Dot product of two equal-length vectors. */
export function dot(a: Vector, b: Vector): number {
  assertSameDim(a, b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** Euclidean magnitude (L2 norm). */
export function magnitude(v: Vector): number {
  return Math.sqrt(dot(v, v));
}

/**
 * Cosine similarity in [-1, 1]. Returns 0 if either vector is the zero vector,
 * since direction is undefined there.
 */
export function cosineSimilarity(a: Vector, b: Vector): number {
  const denom = magnitude(a) * magnitude(b);
  return denom === 0 ? 0 : dot(a, b) / denom;
}

/** Cosine distance in [0, 2] — the natural complement of similarity. */
export function cosineDistance(a: Vector, b: Vector): number {
  return 1 - cosineSimilarity(a, b);
}

/** Euclidean distance between two vectors. */
export function euclideanDistance(a: Vector, b: Vector): number {
  assertSameDim(a, b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** Return a unit-length copy of v. The zero vector is returned unchanged. */
export function normalize(v: Vector): Vector {
  const m = magnitude(v);
  return m === 0 ? v : v.map((x) => x / m);
}

/** Element-wise weighted sum: a*wa + b*wb. */
export function blend(a: Vector, wa: number, b: Vector, wb: number): Vector {
  assertSameDim(a, b);
  return a.map((x, i) => x * wa + b[i] * wb);
}

/** The centroid (mean) of a set of vectors. Throws on an empty set. */
export function centroid(vectors: readonly Vector[]): Vector {
  if (vectors.length === 0) throw new Error('centroid of empty set');
  const dim = vectors[0].length;
  const acc = new Array<number>(dim).fill(0);
  for (const v of vectors) {
    assertSameDim(v, acc);
    for (let i = 0; i < dim; i++) acc[i] += v[i];
  }
  return acc.map((x) => x / vectors.length);
}

/**
 * Exponentially-weighted update of a slow vector toward a new observation.
 * `alpha` is the weight of the new observation in [0,1] — higher = faster drift.
 * This is how the slow user taste vector folds in fresh engagements.
 */
export function ewmaUpdate(slow: Vector, observation: Vector, alpha: number): Vector {
  return blend(slow, 1 - alpha, observation, alpha);
}

/**
 * Request-time query vector: blend the slow user vector with the fast session
 * vector. `sessionWeight` rises as a session lengthens — early on you are who
 * you were, later you are what you're doing.
 */
export function queryVector(user: Vector, session: Vector, sessionWeight: number): Vector {
  const w = clamp01(sessionWeight);
  return blend(user, 1 - w, session, w);
}

/**
 * Recency kernel in (floor, 1]. Multiplies a candidate's score so stale content
 * counts for less — but never zero: the floor keeps the long tail reachable.
 */
export function recencyKernel(ageHours: number, halfLifeHours = 72, floor = 0.2): number {
  const decay = Math.pow(0.5, Math.max(0, ageHours) / halfLifeHours);
  return floor + (1 - floor) * decay;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
