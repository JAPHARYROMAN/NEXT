import { initWebTelemetry } from '@next/telemetry/web';
import { setTelemetrySink } from '@next/frontend-utils';

export function initAppTelemetry(): void {
  initWebTelemetry({
    service: 'next-web',
    env: (process.env['NODE_ENV'] === 'production' ? 'prod' : 'dev') as 'dev' | 'prod',
    version: process.env['NEXT_PUBLIC_APP_VERSION'] ?? '0.1.0',
  });

  setTelemetrySink((event) => {
    if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
      const body = JSON.stringify(event);
      navigator.sendBeacon('/api/telemetry', body);
    }
  });
}
