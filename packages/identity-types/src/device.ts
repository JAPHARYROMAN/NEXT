import type { DeviceId, UserId } from '@next/types';

export const DevicePlatform = [
  'ios',
  'android',
  'web',
  'tv',
  'desktop',
  'immersive',
  'unknown',
] as const;
export type DevicePlatform = (typeof DevicePlatform)[number];

export const DeviceTrustState = ['unverified', 'trusted', 'flagged', 'revoked'] as const;
export type DeviceTrustState = (typeof DeviceTrustState)[number];

export interface Device {
  readonly id: DeviceId;
  readonly userId: UserId;
  readonly platform: DevicePlatform;
  readonly userAgentFamily: string;
  readonly fingerprint: string;
  readonly state: DeviceTrustState;
  readonly firstSeenAt: string;
  readonly lastSeenAt: string;
  readonly lastIpCountry: string;
  readonly riskScore: number; // 0..100
}
