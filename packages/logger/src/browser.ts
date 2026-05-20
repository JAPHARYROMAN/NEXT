// Browser logger — emits to console in dev, batches and POSTs to /api/logs in prod.

import type { LoggerConfig } from './index';

interface BrowserLogger {
  debug(msg: string, fields?: Record<string, unknown>): void;
  info(msg: string, fields?: Record<string, unknown>): void;
  warn(msg: string, fields?: Record<string, unknown>): void;
  error(msg: string, fields?: Record<string, unknown>): void;
}

const BUFFER_LIMIT = 50;
const FLUSH_INTERVAL_MS = 5_000;

export function createBrowserLogger(config: LoggerConfig): BrowserLogger {
  const buffer: Record<string, unknown>[] = [];

  const flush = (): void => {
    if (buffer.length === 0) return;
    const batch = buffer.splice(0, buffer.length);
    if (config.env === 'prod') {
      void fetch('/api/logs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ service: config.service, batch }),
        keepalive: true,
      }).catch(() => {
        /* drop on failure */
      });
    }
  };

  if (typeof window !== 'undefined') {
    setInterval(flush, FLUSH_INTERVAL_MS);
    window.addEventListener('beforeunload', flush);
  }

  const emit =
    (level: 'debug' | 'info' | 'warn' | 'error') =>
    (msg: string, fields: Record<string, unknown> = {}): void => {
      const entry = { level, msg, t: Date.now(), ...fields };
      buffer.push(entry);
      if (buffer.length >= BUFFER_LIMIT) flush();
      if (config.env !== 'prod') {
        // eslint-disable-next-line no-console
        console[level === 'debug' ? 'log' : level](`[${config.service}]`, msg, fields);
      }
    };

  return {
    debug: emit('debug'),
    info: emit('info'),
    warn: emit('warn'),
    error: emit('error'),
  };
}
