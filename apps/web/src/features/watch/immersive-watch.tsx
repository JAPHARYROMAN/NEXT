'use client';

import { useEffect } from 'react';
import { CinematicPlayer } from '@next/player-ui';
import { ChapterNav } from '@next/media-ui';
import { WatchLayout, MediaViewport } from '@next/layout-engine';
import { MediaCard, Surface } from '@next/ui';
import { usePlayerStore, useWatchSessionStore } from '@next/frontend-utils';
import { DiscussionShell, ContextualActions, AppreciationStrip } from '@next/interaction-ui';
import { demoChapters, demoRelated, type WatchMedia } from '@/lib/demo-watch';

export interface ImmersiveWatchProps {
  readonly media: WatchMedia;
}

export function ImmersiveWatch({ media }: ImmersiveWatchProps) {
  const open = usePlayerStore((s) => s.open);
  const setMediaKind = usePlayerStore((s) => s.setMediaKind);
  const discussionOpen = useWatchSessionStore((s) => s.discussionOpen);
  const toggleDiscussion = useWatchSessionStore((s) => s.toggleDiscussion);
  const setMedia = useWatchSessionStore((s) => s.setMedia);
  const panel = useWatchSessionStore((s) => s.panel);
  const setPanel = useWatchSessionStore((s) => s.setPanel);

  useEffect(() => {
    open(media.id, media.title, media.kind === 'live' ? 'live' : 'theater', media.kind);
    setMediaKind(media.kind);
    setMedia(media.id);
  }, [media, open, setMediaKind, setMedia]);

  const player = (
    <CinematicPlayer
      mediaId={media.id}
      title={media.title}
      kind={media.kind}
      durationSec={media.durationSec || 600}
    />
  );

  const metadata = (
    <Surface bordered className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{media.title}</h1>
          <p className="mt-1 text-sm text-muted">{media.creator}</p>
        </div>
        <ContextualActions />
      </div>
      <p className="text-sm text-subtle">{media.description}</p>
      <AppreciationStrip creator={media.creator} />
      <div className="flex flex-wrap gap-2">
        {(['metadata', 'chapters', 'related'] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={
              panel === p
                ? 'rounded-full bg-accent/15 px-3 py-1 text-sm text-accent'
                : 'rounded-full px-3 py-1 text-sm text-muted hover:text-foreground'
            }
            onClick={() => setPanel(p)}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className={
            discussionOpen
              ? 'rounded-full bg-accent/15 px-3 py-1 text-sm text-accent'
              : 'rounded-full px-3 py-1 text-sm text-muted hover:text-foreground'
          }
          onClick={toggleDiscussion}
        >
          Discussion
        </button>
      </div>
      {panel === 'chapters' && media.kind !== 'live' ? (
        <ChapterNav chapters={demoChapters} activeId="intro" />
      ) : null}
      {panel === 'related' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {demoRelated.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              title={item.title}
              creator={item.creator}
              href={`/watch/${item.id}`}
              thumbnailHue={item.thumbnailHue}
            />
          ))}
        </div>
      ) : null}
    </Surface>
  );

  const aside = (
    <Surface bordered className="p-4">
      <h3 className="text-sm font-medium text-muted">Contextual recommendations</h3>
      <div className="mt-4 space-y-3">
        {demoRelated.map((item) => (
          <MediaCard
            key={`rail-${item.id}`}
            id={item.id}
            title={item.title}
            creator={item.creator}
            href={`/watch/${item.id}`}
            thumbnailHue={item.thumbnailHue}
          />
        ))}
      </div>
    </Surface>
  );

  return (
    <MediaViewport>
      <WatchLayout
        player={player}
        main={metadata}
        aside={aside}
        discussion={<DiscussionShell />}
        showDiscussion={discussionOpen}
      />
    </MediaViewport>
  );
}
