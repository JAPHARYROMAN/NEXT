import type { Brand, UserId, SessionId, DeviceId } from '@next/types';

export type FamilyId = Brand<string, 'FamilyId'>;

export const SessionMethod = ['password', 'passkey', 'oauth', 'magic_link', 'refresh'] as const;
export type SessionMethod = (typeof SessionMethod)[number];

export interface Session {
  readonly id: SessionId;
  readonly userId: UserId;
  readonly familyId: FamilyId;
  readonly method: SessionMethod;
  readonly deviceId: DeviceId | null;
  readonly ipCountry: string;
  readonly userAgentFamily: string;
  readonly startedAt: string;
  readonly lastActiveAt: string;
  readonly expiresAt: string;
  readonly revokedAt: string | null;
}

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresAt: string;
  readonly tokenType: 'Bearer';
}
