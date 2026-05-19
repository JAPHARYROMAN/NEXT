// k6 load test — feed endpoint. Runs nightly against staging.
// Usage: k6 run --env BASE=https://api.staging.next.io feed.k6.ts

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

export const options = {
  scenarios: {
    steady: {
      executor: 'constant-arrival-rate',
      rate: 500,
      timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 200,
      maxVUs: 1000,
    },
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 500,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '30s', target: 5000 },
        { duration: '2m', target: 5000 },
        { duration: '1m', target: 100 },
      ],
    },
  },
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(75)<200', 'p(95)<400', 'p(99)<800'],
  },
};

const feedLatency = new Trend('feed_latency_ms');
const BASE = __ENV.BASE ?? 'https://api.staging.next.io';
const TOKEN = __ENV.TOKEN ?? '';

export default function () {
  const r = http.post(
    `${BASE}/graphql`,
    JSON.stringify({
      query: 'query Feed($first: Int!) { feed(first: $first) { edges { node { id title } } pageInfo { hasNextPage endCursor } } }',
      variables: { first: 20 },
    }),
    { headers: { 'content-type': 'application/json', authorization: `Bearer ${TOKEN}` } },
  );

  feedLatency.add(r.timings.duration);

  check(r, {
    'status is 200': (resp) => resp.status === 200,
    'no GraphQL errors': (resp) => !JSON.parse(resp.body as string).errors,
  });

  sleep(0.1);
}
