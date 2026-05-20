import { create } from 'zustand';

export type DeviceHandoff = 'phone' | 'tablet' | 'desktop' | 'tv' | 'unknown';

export interface ResumeSession {
  readonly mediaId: string;
  readonly title: string;
  readonly positionSec: number;
  readonly updatedAt: number;
}

interface ContinuityState {
  readonly resume: ResumeSession | null;
  readonly lastDevice: DeviceHandoff;
  readonly handoffTarget: DeviceHandoff | null;
  readonly syncedPreferences: Record<string, string | number | boolean>;
  readonly setResume: (session: ResumeSession | null) => void;
  readonly setLastDevice: (device: DeviceHandoff) => void;
  readonly requestHandoff: (target: DeviceHandoff) => void;
  readonly clearHandoff: () => void;
  readonly syncPreference: (key: string, value: string | number | boolean) => void;
}

export const useContinuityStore = create<ContinuityState>((set) => ({
  resume: null,
  lastDevice: 'unknown',
  handoffTarget: null,
  syncedPreferences: {},
  setResume: (resume) => set({ resume }),
  setLastDevice: (lastDevice) => set({ lastDevice }),
  requestHandoff: (handoffTarget) => set({ handoffTarget }),
  clearHandoff: () => set({ handoffTarget: null }),
  syncPreference: (key, value) =>
    set((s) => ({
      syncedPreferences: { ...s.syncedPreferences, [key]: value },
    })),
}));
