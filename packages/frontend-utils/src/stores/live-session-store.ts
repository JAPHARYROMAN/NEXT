import { create } from 'zustand';

export type StreamHealth = 'healthy' | 'degraded' | 'critical';

export type LiveSessionPhase = 'offline' | 'preflight' | 'live' | 'ended';

interface LiveSessionState {
  readonly isLive: boolean;
  readonly phase: LiveSessionPhase;
  readonly health: StreamHealth;
  readonly viewerCount: number;
  readonly chatEnabled: boolean;
  readonly streamId: string | null;
  readonly setLive: (live: boolean) => void;
  readonly setPhase: (phase: LiveSessionPhase) => void;
  readonly setHealth: (health: StreamHealth) => void;
  readonly setViewerCount: (count: number) => void;
  readonly setChatEnabled: (enabled: boolean) => void;
  readonly setStreamId: (id: string | null) => void;
}

export const useLiveSessionStore = create<LiveSessionState>((set) => ({
  isLive: false,
  phase: 'offline',
  health: 'healthy',
  viewerCount: 0,
  chatEnabled: true,
  streamId: null,
  setLive: (isLive) =>
    set({
      isLive,
      phase: isLive ? 'live' : 'offline',
    }),
  setPhase: (phase) =>
    set({
      phase,
      isLive: phase === 'live',
    }),
  setHealth: (health) => set({ health }),
  setViewerCount: (viewerCount) => set({ viewerCount }),
  setChatEnabled: (chatEnabled) => set({ chatEnabled }),
  setStreamId: (streamId) => set({ streamId }),
}));
