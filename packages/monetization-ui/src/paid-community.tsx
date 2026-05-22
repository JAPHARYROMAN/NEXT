'use client';

import type { ReactNode } from 'react';
import { Surface } from '@next/ui';
import { MembershipTierCard } from '@next/subscription-ui';
import type { MembershipTier } from '@next/subscription-ui';

export interface PaidCommunityLandingProps {
  readonly communityName: string;
  readonly tagline: string;
  readonly memberCount: number;
  readonly tiers: readonly MembershipTier[];
  readonly benefitsPreview: readonly string[];
}

export function PaidCommunityLanding({
  communityName,
  tagline,
  memberCount,
  tiers,
  benefitsPreview,
}: PaidCommunityLandingProps) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{communityName}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">{tagline}</p>
        <p className="mt-2 text-xs text-muted">{memberCount.toLocaleString()} members</p>
      </header>
      <Surface bordered className="p-5">
        <h2 className="text-sm font-medium text-fg">Member benefits preview</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {benefitsPreview.map((benefit) => (
            <li key={benefit}>· {benefit}</li>
          ))}
        </ul>
      </Surface>
      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map((tier) => (
          <MembershipTierCard key={tier.id} tier={tier} />
        ))}
      </div>
    </div>
  );
}

export interface GatedSectionProps {
  readonly title: string;
  readonly locked: boolean;
  readonly children: ReactNode;
}

export function GatedSection({ title, locked, children }: GatedSectionProps) {
  if (!locked) return <>{children}</>;
  return (
    <Surface bordered className="p-5">
      <h3 className="text-sm font-medium text-fg">{title}</h3>
      <p className="mt-2 text-sm text-muted">Members-only section — join to participate.</p>
    </Surface>
  );
}

export interface MemberEventsPanelProps {
  readonly events: readonly { id: string; title: string; schedule: string }[];
}

export function MemberEventsPanel({ events }: MemberEventsPanelProps) {
  return (
    <Surface bordered className="p-5" aria-label="Member events">
      <h3 className="text-sm font-medium text-fg">Member events</h3>
      <ul className="mt-3 space-y-2" role="list">
        {events.map((event) => (
          <li key={event.id} className="rounded-lg border border-subtle/10 px-3 py-2 text-sm">
            <p className="text-fg">{event.title}</p>
            <p className="text-xs text-muted">{event.schedule}</p>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
