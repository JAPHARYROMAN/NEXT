import { trace, context } from '@opentelemetry/api';
import pino, { type Logger, type LoggerOptions } from 'pino';

export interface LoggerConfig {
  readonly service: string;
  readonly env: 'dev' | 'staging' | 'prod' | 'test';
  readonly version?: string;
  readonly level?: pino.Level;
}

const PII_KEYS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'set-cookie',
  'email',
  'phone',
  'ip',
  'ssn',
  'creditCard',
] as const;

export function createLogger(config: LoggerConfig): Logger {
  const base: LoggerOptions = {
    level: config.level ?? (config.env === 'prod' ? 'info' : 'debug'),
    base: {
      service: config.service,
      env: config.env,
      version: config.version,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
      log: (obj) => {
        const span = trace.getSpan(context.active());
        if (!span) return obj;
        const ctx = span.spanContext();
        return { ...obj, trace_id: ctx.traceId, span_id: ctx.spanId };
      },
    },
    redact: {
      paths: [
        ...PII_KEYS,
        ...PII_KEYS.map((k) => `*.${k}`),
        ...PII_KEYS.map((k) => `req.headers.${k}`),
        ...PII_KEYS.map((k) => `user.${k}`),
      ],
      censor: '[redacted]',
    },
  };

  if (config.env === 'dev' || config.env === 'test') {
    return pino({
      ...base,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l' },
      },
    });
  }

  return pino(base);
}

export type { Logger } from 'pino';
