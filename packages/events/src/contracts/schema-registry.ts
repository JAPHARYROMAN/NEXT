import { eventCategoryByType, eventPayloadSchemas, type EventType } from './envelope';

export type SchemaCompatibility = 'BACKWARD' | 'FORWARD' | 'FULL' | 'NONE';

export interface SchemaRegistrySubject {
  readonly subject: string;
  readonly eventType: EventType;
  readonly category: string;
  readonly version: '1.0';
  readonly compatibility: SchemaCompatibility;
}

export function schemaSubjectForEventType(eventType: EventType): string {
  return `next.${eventCategoryByType[eventType]}.${eventType}.v1-value`;
}

export function schemaRegistrySubjects(): readonly SchemaRegistrySubject[] {
  return Object.keys(eventPayloadSchemas).map((eventType) => {
    const typedEventType = eventType as EventType;
    return {
      subject: schemaSubjectForEventType(typedEventType),
      eventType: typedEventType,
      category: eventCategoryByType[typedEventType],
      version: '1.0',
      compatibility: 'BACKWARD',
    };
  });
}

export function assertBackwardCompatibleChange(change: {
  readonly removedFields: readonly string[];
  readonly requiredFieldsAdded: readonly string[];
  readonly fieldTypeChanges: readonly string[];
}): void {
  const violations = [
    ...change.removedFields.map((field) => `removed field ${field}`),
    ...change.requiredFieldsAdded.map((field) => `added required field ${field}`),
    ...change.fieldTypeChanges.map((field) => `changed type for ${field}`),
  ];

  if (violations.length > 0) {
    throw new Error(`Schema change is not backward compatible: ${violations.join(', ')}`);
  }
}
