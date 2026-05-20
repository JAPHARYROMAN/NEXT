import { describe, expect, it } from 'vitest';
import {
  assertBackwardCompatibleChange,
  deadLetterTopicForCategory,
  eventCategoryByType,
  partitionKeyForEvent,
  playbackStartedFixture,
  schemaRegistrySubjects,
  topicForCategory,
  validateEventEnvelope,
} from '../../../packages/events/src';

describe('NEXT event contracts', () => {
  it('validates a canonical playback envelope', () => {
    const event = playbackStartedFixture();

    expect(validateEventEnvelope(event)).toEqual(event);
    expect(eventCategoryByType.playback_started).toBe('playback');
    expect(topicForCategory(event.event_category)).toBe('playback.events.v1');
    expect(partitionKeyForEvent(event)).toBe(event.media_id);
  });

  it('rejects category drift', () => {
    const event = playbackStartedFixture({ event_category: 'media' });

    expect(() => validateEventEnvelope(event)).toThrow(/belongs to playback/);
  });

  it('rejects malformed payloads before Kafka publish', () => {
    const event = playbackStartedFixture({
      payload: {
        position_ms: -1,
      },
    });

    expect(() => validateEventEnvelope(event)).toThrow(/position_ms/);
  });

  it('keeps DLQ routing explicit for high-risk streams', () => {
    expect(deadLetterTopicForCategory('identity')).toBe('identity.events.dlq.v1');
    expect(deadLetterTopicForCategory('playback')).toBe('playback.events.dlq.v1');
    expect(deadLetterTopicForCategory('search')).toBe('analytics.events.dlq.v1');
  });

  it('publishes every payload schema as a registry subject', () => {
    const subjects = schemaRegistrySubjects();

    expect(subjects.length).toBeGreaterThan(30);
    expect(subjects).toContainEqual({
      subject: 'next.playback.playback_started.v1-value',
      eventType: 'playback_started',
      category: 'playback',
      version: '1.0',
      compatibility: 'BACKWARD',
    });
  });

  it('blocks non-backward-compatible schema evolution', () => {
    expect(() =>
      assertBackwardCompatibleChange({
        removedFields: ['user_id'],
        requiredFieldsAdded: [],
        fieldTypeChanges: [],
      }),
    ).toThrow(/not backward compatible/);
  });
});
