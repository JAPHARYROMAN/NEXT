import { create } from 'zustand';

export type UploadPhase =
  | 'idle'
  | 'validating'
  | 'uploading'
  | 'processing'
  | 'metadata'
  | 'publish';

export interface UploadMetadata {
  readonly title: string;
  readonly description: string;
  readonly visibility: 'public' | 'unlisted' | 'private';
}

interface UploadFileState {
  readonly name: string;
  readonly percent: number;
  readonly chunked: boolean;
}

interface UploadState {
  readonly phase: UploadPhase;
  readonly files: readonly UploadFileState[];
  readonly metadata: UploadMetadata;
  readonly setPhase: (phase: UploadPhase) => void;
  readonly addFile: (file: UploadFileState) => void;
  readonly updateProgress: (name: string, percent: number) => void;
  readonly setMetadata: (patch: Partial<UploadMetadata>) => void;
  readonly reset: () => void;
}

const defaultMetadata: UploadMetadata = {
  title: '',
  description: '',
  visibility: 'public',
};

export const useUploadStore = create<UploadState>((set) => ({
  phase: 'idle',
  files: [],
  metadata: defaultMetadata,
  setPhase: (phase) => set({ phase }),
  addFile: (file) => set((s) => ({ files: [...s.files, file] })),
  updateProgress: (name, percent) =>
    set((s) => ({
      files: s.files.map((f) => (f.name === name ? { ...f, percent } : f)),
    })),
  setMetadata: (patch) => set((s) => ({ metadata: { ...s.metadata, ...patch } })),
  reset: () => set({ phase: 'idle', files: [], metadata: defaultMetadata }),
}));
