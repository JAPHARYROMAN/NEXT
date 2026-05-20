'use client';

import clsx from 'clsx';
import { useDiscussionComposerStore, trackDiscussionLatency } from '@next/frontend-utils';

export interface ThreadComposerProps {
  readonly placeholder?: string;
  readonly className?: string;
}

export function ThreadComposer({
  placeholder = 'Share a calm, constructive thought…',
  className,
}: ThreadComposerProps) {
  const draft = useDiscussionComposerStore((s) => s.draft);
  const setDraft = useDiscussionComposerStore((s) => s.setDraft);
  const quote = useDiscussionComposerStore((s) => s.quotePreview);
  const clearQuote = useDiscussionComposerStore((s) => s.clearQuote);

  return (
    <form
      className={clsx('space-y-2', className)}
      onSubmit={(e) => {
        e.preventDefault();
        const t0 = performance.now();
        trackDiscussionLatency('compose_submit', Math.round(performance.now() - t0));
        setDraft('');
        clearQuote();
      }}
    >
      {quote ? (
        <div className="flex items-start justify-between gap-2 rounded-lg bg-elevated/50 p-2 text-xs text-muted">
          <span>Quoting: {quote}</span>
          <button type="button" className="text-accent" onClick={clearQuote}>
            Clear
          </button>
        </div>
      ) : null}
      <label className="sr-only" htmlFor="thread-composer">
        Compose reply
      </label>
      <textarea
        id="thread-composer"
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-subtle/20 bg-transparent px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg border border-subtle/20 px-3 py-1.5 text-xs text-muted"
          aria-label="Attach media"
        >
          Media
        </button>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-bg"
          disabled={!draft.trim()}
        >
          Post
        </button>
      </div>
    </form>
  );
}
