import { create } from 'zustand';

interface DiscussionComposerState {
  readonly draft: string;
  readonly quotePreview: string | null;
  readonly setDraft: (draft: string) => void;
  readonly setQuote: (quote: string) => void;
  readonly clearQuote: () => void;
}

export const useDiscussionComposerStore = create<DiscussionComposerState>((set) => ({
  draft: '',
  quotePreview: null,
  setDraft: (draft) => set({ draft }),
  setQuote: (quotePreview) => set({ quotePreview }),
  clearQuote: () => set({ quotePreview: null }),
}));
