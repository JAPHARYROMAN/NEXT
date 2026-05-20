import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConsentPrefs {
  readonly analytics: boolean;
  readonly personalization: boolean;
  readonly marketing: boolean;
}

interface PrivacyState {
  readonly consent: ConsentPrefs;
  readonly dataExportRequested: boolean;
  readonly personalizationTransparent: boolean;
  readonly sessionTrustPlaceholder: string;
  readonly setConsent: (partial: Partial<ConsentPrefs>) => void;
  readonly requestDataExport: () => void;
  readonly setPersonalizationTransparent: (v: boolean) => void;
  readonly reset: () => void;
}

const defaultConsent: ConsentPrefs = {
  analytics: false,
  personalization: true,
  marketing: false,
};

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      consent: defaultConsent,
      dataExportRequested: false,
      personalizationTransparent: true,
      sessionTrustPlaceholder: '2 devices · last active demo',
      setConsent: (partial) => set((s) => ({ consent: { ...s.consent, ...partial } })),
      requestDataExport: () => set({ dataExportRequested: true }),
      setPersonalizationTransparent: (personalizationTransparent) =>
        set({ personalizationTransparent }),
      reset: () =>
        set({
          consent: defaultConsent,
          dataExportRequested: false,
          personalizationTransparent: true,
          sessionTrustPlaceholder: '2 devices · last active demo',
        }),
    }),
    { name: 'next-privacy-v1' },
  ),
);
