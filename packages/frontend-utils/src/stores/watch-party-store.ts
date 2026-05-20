import { create } from 'zustand';

export type WatchPartyPhase = 'lobby' | 'sync' | 'watching' | 'discussion';

interface WatchPartyState {
  readonly partyId: string | null;
  readonly isHost: boolean;
  readonly phase: WatchPartyPhase;
  readonly syncOffsetMs: number | null;
  readonly setParty: (partyId: string, isHost?: boolean) => void;
  readonly setPhase: (phase: WatchPartyPhase) => void;
  readonly setSyncOffset: (ms: number | null) => void;
  readonly leave: () => void;
}

export const useWatchPartyStore = create<WatchPartyState>((set) => ({
  partyId: null,
  isHost: false,
  phase: 'lobby',
  syncOffsetMs: null,
  setParty: (partyId, isHost = false) => set({ partyId, isHost, phase: 'sync' }),
  setPhase: (phase) => set({ phase }),
  setSyncOffset: (syncOffsetMs) => set({ syncOffsetMs }),
  leave: () => set({ partyId: null, isHost: false, phase: 'lobby', syncOffsetMs: null }),
}));
