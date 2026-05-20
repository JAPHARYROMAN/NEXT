export type ReadinessState = 'draft' | 'preflight' | 'ready' | 'live' | 'ended';

export type HealthSeverity = 'ok' | 'watch' | 'attention';

export interface StreamHealthMetric {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly severity: HealthSeverity;
  readonly hint?: string;
}

export interface PreflightItem {
  readonly id: string;
  readonly label: string;
  readonly passed: boolean;
  readonly detail?: string;
}

export interface StreamSetupDraft {
  readonly title: string;
  readonly description: string;
  readonly visibility: 'public' | 'unlisted' | 'members';
  readonly scheduledAt?: string;
}

export interface ClipMarker {
  readonly id: string;
  readonly label: string;
  readonly atSec: number;
  readonly status: 'pending' | 'approved' | 'published';
}
