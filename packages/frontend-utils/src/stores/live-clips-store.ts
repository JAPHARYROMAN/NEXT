import { create } from 'zustand';

export interface LiveClipDraft {
  readonly id: string;
  readonly label: string;
  readonly atSec: number;
  readonly status: 'pending' | 'approved';
}

interface LiveClipsState {
  readonly markers: readonly LiveClipDraft[];
  readonly addMarker: (marker: LiveClipDraft) => void;
  readonly approveMarker: (id: string) => void;
}

export const useLiveClipsStore = create<LiveClipsState>((set) => ({
  markers: [],
  addMarker: (marker) => set((s) => ({ markers: [...s.markers, marker] })),
  approveMarker: (id) =>
    set((s) => ({
      markers: s.markers.map((m) => (m.id === id ? { ...m, status: 'approved' as const } : m)),
    })),
}));
