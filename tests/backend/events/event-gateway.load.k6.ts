import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString, uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  scenarios: {
    steady_ingest: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.EVENT_RATE ?? '500'),
      timeUnit: '1s',
      duration: __ENV.DURATION ?? '5m',
      preAllocatedVUs: 100,
      maxVUs: 500,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<250', 'p(99)<750'],
  },
};

const baseUrl = __ENV.EVENT_GATEWAY_URL ?? 'http://localhost:8080';

export default function () {
  const eventId = uuidv4();
  const mediaId = `media_${randomString(26)}`;
  const payload = JSON.stringify({
    event_id: eventId,
    event_type: 'playback_started',
    event_version: '1.0',
    event_category: 'playback',
    producer: 'playback-service',
    timestamp: new Date().toISOString(),
    user_id: uuidv4(),
    creator_id: uuidv4(),
    media_id: mediaId,
    session_id: uuidv4(),
    device_id: `device_${randomString(26)}`,
    request_id: `req_${randomString(16)}`,
    correlation_id: `corr_${randomString(16)}`,
    idempotency_key: `load:${eventId}`,
    payload: {
      position_ms: 0,
      rendition: '1080p',
      startup_latency_ms: Math.floor(Math.random() * 500),
    },
    metadata: {
      platform: 'web',
      region: 'us-east-1',
      ip_hash: null,
      user_agent_hash: null,
    },
  });

  const res = http.post(`${baseUrl}/v1/events`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-NEXT-Region': 'us-east-1',
    },
  });

  check(res, {
    accepted: (r) => r.status === 202,
  });
  sleep(0.01);
}
