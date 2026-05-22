import { createEventEnvelope, type EventEnvelope } from './envelope';

export function playbackStartedFixture(overrides: Partial<EventEnvelope> = {}): EventEnvelope {
  return {
    ...createEventEnvelope({
      event_type: 'playback_started',
      producer: 'playback-service',
      user_id: '11111111-1111-4111-8111-111111111111',
      creator_id: '22222222-2222-4222-8222-222222222222',
      media_id: 'media_01HZZZZZZZZZZZZZZZZZZZZZZZ',
      session_id: '33333333-3333-4333-8333-333333333333',
      device_id: 'device_01HZZZZZZZZZZZZZZZZZZZZZZZ',
      request_id: 'req_fixture',
      correlation_id: 'corr_fixture',
      idempotency_key: 'playback-service:fixture:playback-started',
      payload: {
        position_ms: 0,
        rendition: '1080p',
        startup_latency_ms: 123,
      },
      metadata: {
        platform: 'web',
        region: 'us-east-1',
        ip_hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        user_agent_hash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
    }),
    ...overrides,
  };
}

export function systemStartedFixture(overrides: Partial<EventEnvelope> = {}): EventEnvelope {
  return {
    ...createEventEnvelope({
      event_type: 'service_started',
      producer: 'event-gateway',
      idempotency_key: 'event-gateway:fixture:service-started',
      payload: {
        service_name: 'event-gateway',
        service_version: '0.0.0-test',
        environment: 'test',
      },
      metadata: {
        platform: 'service',
        region: 'local',
        ip_hash: null,
        user_agent_hash: null,
      },
    }),
    ...overrides,
  };
}
