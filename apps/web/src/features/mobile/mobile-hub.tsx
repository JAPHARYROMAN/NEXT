'use client';

import Link from 'next/link';
import { HandoffCard } from '@next/mobile-ui';
import { focusRing } from '@next/design-system';

const links = [
  { href: '/mobile/feed', label: 'Adaptive feed', desc: 'Scroll and immersive swipe' },
  { href: '/mobile/watch/demo-1', label: 'Immersive player', desc: 'Fullscreen gestures' },
  { href: '/mobile/creator', label: 'Creator studio', desc: 'Upload and analytics preview' },
  { href: '/mobile/community', label: 'Community', desc: 'Discussions and watch party' },
  { href: '/mobile/offline', label: 'Offline', desc: 'Downloads and drafts' },
  { href: '/mobile/continuity', label: 'Continuity', desc: 'Resume and handoff' },
] as const;

export function MobileHub() {
  return (
    <div className="space-y-8 px-4 py-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">NEXT Mobile</h1>
        <p className="mt-2 text-sm text-muted">
          Touch-native, cinematic, adaptive — not a cramped clone.
        </p>
      </header>
      <HandoffCard />
      <nav aria-label="Mobile experiences" className="grid gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`block rounded-2xl border border-subtle/15 bg-surface/40 px-4 py-4 ${focusRing}`}
          >
            <span className="font-medium">{l.label}</span>
            <span className="mt-1 block text-sm text-muted">{l.desc}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
