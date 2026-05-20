import { create } from 'zustand';
import { trackInteraction } from '../telemetry';

interface InteractionState {
  readonly reactionPulse: boolean;
  readonly lastReaction: string | null;
  readonly sendReaction: (symbol: string) => void;
  readonly clearPulse: () => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  reactionPulse: false,
  lastReaction: null,
  sendReaction: (symbol) => {
    const t0 = performance.now();
    set({ reactionPulse: true, lastReaction: symbol });
    trackInteraction('reaction', symbol, Math.round(performance.now() - t0));
    setTimeout(() => set({ reactionPulse: false }), 1200);
  },
  clearPulse: () => set({ reactionPulse: false }),
}));
