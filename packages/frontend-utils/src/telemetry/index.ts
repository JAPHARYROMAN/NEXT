export interface TelemetryEvent {
  readonly name: string;
  readonly properties?: Record<string, string | number | boolean>;
}

type TelemetrySink = (event: TelemetryEvent) => void;

let sink: TelemetrySink = (event) => {
  if (process.env['NODE_ENV'] === 'development') {
    console.debug('[telemetry]', event.name, event.properties);
  }
};

export function setTelemetrySink(next: TelemetrySink): void {
  sink = next;
}

export function track(event: TelemetryEvent): void {
  sink(event);
}

export function trackNavigation(from: string, to: string, durationMs: number): void {
  track({ name: 'navigation', properties: { from, to, durationMs } });
}

export function trackInteraction(action: string, target: string, latencyMs: number): void {
  track({ name: 'interaction', properties: { action, target, latencyMs } });
}

export function trackRender(component: string, durationMs: number): void {
  track({ name: 'render', properties: { component, durationMs } });
}

export function trackError(error: string, surface: string): void {
  track({ name: 'error', properties: { error, surface } });
}
