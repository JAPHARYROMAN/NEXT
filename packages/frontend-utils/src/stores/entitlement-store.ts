import { create } from 'zustand';

export type EntitlementPreviewState =
  | 'entitled'
  | 'not_entitled'
  | 'expired'
  | 'grace'
  | 'pending_payment'
  | 'refund_pending'
  | 'revoked'
  | 'creator_comp';

interface EntitlementStoreState {
  readonly previewState: EntitlementPreviewState;
  readonly resourceId: string | null;
  readonly setPreviewState: (state: EntitlementPreviewState) => void;
  readonly setResource: (resourceId: string) => void;
}

export const useEntitlementStore = create<EntitlementStoreState>((set) => ({
  previewState: 'not_entitled',
  resourceId: null,
  setPreviewState: (previewState) => set({ previewState }),
  setResource: (resourceId) => set({ resourceId }),
}));
