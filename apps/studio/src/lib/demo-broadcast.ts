import type { ClipMarker, PreflightItem, StreamHealthMetric } from '@next/broadcast-ui';

export const demoPreflight: readonly PreflightItem[] = [
  { id: 'audio', label: 'Audio levels in range', passed: true },
  { id: 'video', label: 'Camera / capture connected', passed: true },
  {
    id: 'ingest',
    label: 'Ingest endpoint reachable',
    passed: false,
    detail: 'Mock — wire encoder',
  },
  { id: 'title', label: 'Title & visibility set', passed: true },
];

export const demoHealthMetrics: readonly StreamHealthMetric[] = [
  { id: 'bitrate', label: 'Bitrate', value: '6.2 Mbps', severity: 'ok' },
  {
    id: 'latency',
    label: 'Latency',
    value: '2.1 s',
    severity: 'watch',
    hint: 'Within acceptable range',
  },
  { id: 'frames', label: 'Dropped frames', value: '0.2%', severity: 'ok' },
  { id: 'ingest', label: 'Ingest', value: 'Connected', severity: 'ok' },
  { id: 'av', label: 'A/V sync', value: 'Stable', severity: 'ok' },
  { id: 'qoe', label: 'Audience QoE', value: 'Good', severity: 'ok' },
];

export const demoClipMarkers: readonly ClipMarker[] = [
  { id: 'clip-1', label: 'Crowd reaction', atSec: 482, status: 'pending' },
  { id: 'clip-2', label: 'Creator insight', atSec: 1204, status: 'approved' },
];

export const demoFlagged = [
  { id: 'f1', author: '@spam', excerpt: 'Buy now!!!', reason: 'spam pattern' },
] as const;

export const demoMuted = [{ id: 'm1', handle: '@noisy', until: '10 min' }] as const;

export const demoEventChecklist = [
  { id: 'e1', label: 'Disclose sponsorship', done: true },
  { id: 'e2', label: 'Test chat slow mode', done: false },
  { id: 'e3', label: 'Confirm premiere countdown', done: true },
] as const;
