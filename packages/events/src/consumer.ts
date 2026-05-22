import { context, propagation, trace } from '@opentelemetry/api';
import { Kafka, type Consumer, type EachMessagePayload } from 'kafkajs';
import { safeValidateEventEnvelope, type EventEnvelope } from './contracts/envelope';

export interface ConsumerConfig {
  readonly brokers: readonly string[];
  readonly clientId: string;
  readonly groupId: string;
  readonly ssl?: boolean;
  readonly sasl?: { mechanism: 'scram-sha-512'; username: string; password: string };
}

export type EventHandler<T> = (
  payload: T,
  meta: {
    topic: string;
    partition: number;
    offset: string;
    key: string;
    headers: Record<string, string>;
  },
) => Promise<void>;

export class EventConsumer {
  private readonly consumer: Consumer;

  constructor(config: ConsumerConfig) {
    const kafka = new Kafka({
      clientId: config.clientId,
      brokers: [...config.brokers],
      ssl: config.ssl ?? true,
      ...(config.sasl ? { sasl: config.sasl } : {}),
    });
    this.consumer = kafka.consumer({
      groupId: config.groupId,
      sessionTimeout: 30_000,
      heartbeatInterval: 3_000,
      maxBytesPerPartition: 1_048_576,
      readUncommitted: false,
    });
  }

  async subscribe<T>(topic: string, handler: EventHandler<T>): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic, fromBeginning: false });

    const tracer = trace.getTracer('@next/events');

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(payload.message.headers ?? {})) {
          if (v != null) headers[k] = v.toString();
        }
        const parentCtx = propagation.extract(context.active(), headers);

        await context.with(parentCtx, async () => {
          await tracer.startActiveSpan(`kafka.consume ${payload.topic}`, async (span) => {
            try {
              const value = JSON.parse(payload.message.value?.toString() ?? 'null') as T;
              await handler(value, {
                topic: payload.topic,
                partition: payload.partition,
                offset: payload.message.offset,
                key: payload.message.key?.toString() ?? '',
                headers,
              });
              span.setStatus({ code: 1 });
            } catch (err) {
              span.recordException(err as Error);
              span.setStatus({ code: 2, message: (err as Error).message });
              throw err;
            } finally {
              span.end();
            }
          });
        });
      },
    });
  }

  async subscribeEvents(topic: string, handler: EventHandler<EventEnvelope>): Promise<void> {
    await this.subscribe<unknown>(topic, async (payload, meta) => {
      const result = safeValidateEventEnvelope(payload);
      if (!result.success) {
        throw new Error(`invalid NEXT event envelope: ${result.error.message}`);
      }
      await handler(result.data, meta);
    });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}

export function parseEventMessage(value: Buffer | string | null | undefined): EventEnvelope {
  const raw = typeof value === 'string' ? value : value?.toString();
  const result = safeValidateEventEnvelope(JSON.parse(raw ?? 'null'));
  if (!result.success) {
    throw new Error(`invalid NEXT event envelope: ${result.error.message}`);
  }
  return result.data;
}
