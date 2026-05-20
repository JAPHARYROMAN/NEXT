'use client';

import Link from 'next/link';
import { WatchPartyShell } from '@next/creator-ui';
import { demoWatchParties } from '@/lib/demo-watch-party';
import { focusRing } from '@next/design-system';
import clsx from 'clsx';

export function WatchPartyLobby() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Watch parties</h1>
        <p className="text-muted">
          Sync viewing with calm group chat — host controls and shared queue.
        </p>
      </header>
      <ul className="space-y-4">
        {demoWatchParties.map((party) => (
          <li key={party.id}>
            <Link
              href={`/watch-party/${party.id}`}
              className={clsx('block rounded-xl transition-opacity hover:opacity-90', focusRing)}
            >
              <WatchPartyShell
                title={party.title}
                participants={party.participants.map((p) => p.label)}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
