// Initialize OpenTelemetry SDK for a Node service.
// Call once at process start, before importing any instrumented module.

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_SERVICE_NAMESPACE,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

export interface TelemetryConfig {
  readonly service: string;
  readonly namespace: string;
  readonly env: 'dev' | 'staging' | 'prod' | 'test';
  readonly version?: string;
  readonly otlpEndpoint?: string;
}

let sdk: NodeSDK | undefined;

export function initTelemetry(config: TelemetryConfig): NodeSDK {
  if (sdk) return sdk;

  const endpoint =
    config.otlpEndpoint ??
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    'http://otel-collector.next-observability:4317';

  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: config.service,
    [SEMRESATTRS_SERVICE_NAMESPACE]: config.namespace,
    [SEMRESATTRS_SERVICE_VERSION]: config.version ?? '0.0.0',
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.env,
  });

  sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({ url: endpoint }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({ url: endpoint }),
      exportIntervalMillis: 30_000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();

  const shutdown = async (): Promise<void> => {
    await sdk?.shutdown();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());

  return sdk;
}

export { trace, metrics, context, SpanKind, SpanStatusCode } from '@opentelemetry/api';
