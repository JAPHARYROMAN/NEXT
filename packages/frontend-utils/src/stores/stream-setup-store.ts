import { create } from 'zustand';

export type StreamVisibility = 'public' | 'unlisted' | 'members';

interface StreamSetupState {
  readonly title: string;
  readonly description: string;
  readonly visibility: StreamVisibility;
  readonly scheduledAt: string | null;
  readonly readiness: 'draft' | 'preflight' | 'ready';
  readonly setField: (
    field: 'title' | 'description' | 'visibility' | 'scheduledAt',
    value: string,
  ) => void;
  readonly setReadiness: (readiness: StreamSetupState['readiness']) => void;
}

export const useStreamSetupStore = create<StreamSetupState>((set) => ({
  title: '',
  description: '',
  visibility: 'public',
  scheduledAt: null,
  readiness: 'draft',
  setField: (field, value) =>
    set(
      field === 'scheduledAt'
        ? { scheduledAt: value || null }
        : ({ [field]: value } as Pick<StreamSetupState, typeof field>),
    ),
  setReadiness: (readiness) => set({ readiness }),
}));
