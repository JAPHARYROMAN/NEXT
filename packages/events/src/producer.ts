import { trace, context, propagation } from '@opentelemetry/api';
import { Kafka, type Producer, type Message } from 'kafkajs';
import {
  partitionKeyForEvent,
  validateEventEnvelope,
  type EventEnvelope as NextEventEnvelope,
} from './contracts/envelope';
import { topicForCategory } from './topics';

export interface ProducerConfig {
  readonly brokers: readonly string[];
  readonly clientId: string;
  readonly ssl?: boolean;
  readonly sasl?: { mechanism: 'scram-sha-512'; username: string; password: string };
}

export interface KafkaEventEnvelope<T> {
  readonly topic: string;
  readonly key: string;
  readonly value: T;
  readonly headers?: Record<string, string>;
}

export class EventProducer {
  private readonly producer: Producer;

  constructor(config: ProducerConfig) {
    const kafka = new Kafka({
      clientId: config.clientId,
      brokers: [...config.brokers],
      ssl: config.ssl ?? true,
      ...(config.sasl ? { sasl: config.sasl } : {}),
    });
    this.producer = kafka.producer({
      idempotent: true,
      maxInFlightRequests: 5,
      retry: { retries: 8 },
    });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async emit<T>(envelope: KafkaEventEnvelope<T>): Promise<void> {
    const tracer = trace.getTracer('@next/events');
    await tracer.startActiveSpan(`kafka.produce ${envelope.topic}`, async (span) => {
      try {
        const carrier: Record<string, string> = {};
        propagation.inject(context.active(), carrier);
        const headers: Record<string, string> = { ...envelope.headers, ...carrier };

        const message: Message = {
          key: envelope.key,
          value: Buffer.from(JSON.stringify(envelope.value)),
          headers,
        };

        await this.producer.send({ topic: envelope.topic, messages: [message] });
        span.setStatus({ code: 1 });
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({ code: 2, message: (err as Error).message });
        throw err;
      } finally {
        span.end();
      }
    });
  }

  async emitEvent(event: NextEventEnvelope): Promise<void> {
    const validated = validateEventEnvelope(event);
    await this.emit({
      topic: topicForCategory(validated.event_category),
      key: partitionKeyForEvent(validated),
      value: validated,
      headers: {
        'next.event_id': validated.event_id,
        'next.event_type': validated.event_type,
        'next.event_version': validated.event_version,
        'next.event_category': validated.event_category,
        'next.producer': validated.producer,
        'next.correlation_id': validated.correlation_id ?? '',
      },
    });
  }
}
