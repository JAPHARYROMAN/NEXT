'use client';

import { MediaCard, Surface } from '@next/ui';
import { demoLibrarySections } from '@/lib/demo-library';

export function LibraryExperience() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-semibold">Library</h1>
        <p className="max-w-xl text-sm text-muted">
          Saved media, history, playlists, and subscriptions — calm organization without clutter.
        </p>
      </header>

      {demoLibrarySections.map((section) => (
        <section key={section.id} aria-labelledby={`lib-${section.id}`}>
          <h2 id={`lib-${section.id}`} className="font-display text-lg font-medium">
            {section.title}
          </h2>
          {section.items.length === 0 ? (
            <Surface bordered className="mt-4 p-6 text-sm text-muted">
              Nothing here yet.
            </Surface>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
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
          )}
        </section>
      ))}

      <Surface bordered className="p-6">
        <h2 className="font-display text-lg font-medium">Discovery archive</h2>
        <p className="mt-2 text-sm text-muted">
          Moments you saved from chaos and exploration lanes — syncs when archive API ships.
        </p>
      </Surface>
    </div>
  );
}
