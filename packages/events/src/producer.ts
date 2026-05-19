import { trace, context, propagation } from '@opentelemetry/api';
import { Kafka, type Producer, type Message } from 'kafkajs';

export interface ProducerConfig {
  readonly brokers: readonly string[];
  readonly clientId: string;
  readonly ssl?: boolean;
  readonly sasl?: { mechanism: 'scram-sha-512'; username: string; password: string };
}

export interface EventEnvelope<T> {
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
      transactionalId: undefined,
      retry: { retries: 8 },
    });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async emit<T>(envelope: EventEnvelope<T>): Promise<void> {
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
}
