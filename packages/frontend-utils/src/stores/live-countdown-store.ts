import { create } from 'zustand';

interface LiveCountdownState {
  readonly eventId: string | null;
  readonly startsInSec: number;
  readonly reminderSet: boolean;
  readonly setEvent: (eventId: string, startsInSec: number) => void;
  readonly tick: (deltaSec?: number) => void;
  readonly setReminder: (set: boolean) => void;
}

export const useLiveCountdownStore = create<LiveCountdownState>((set) => ({
  eventId: null,
  startsInSec: 0,
  reminderSet: false,
  setEvent: (eventId, startsInSec) => set({ eventId, startsInSec }),
  tick: (deltaSec = 1) =>
    set((s) => ({
      startsInSec: Math.max(0, s.startsInSec - deltaSec),
    })),
  setReminder: (reminderSet) => set({ reminderSet }),
}));
