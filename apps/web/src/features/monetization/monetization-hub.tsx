'use client';

import Link from 'next/link';
import { Surface } from '@next/ui';
import { EntitlementStatePanel } from '@next/entitlement-ui';
import { demoEntitlements } from '@/lib/demo-monetization';

const links = [
  {
    href: '/subscriptions',
    label: 'Subscriptions',
    detail: 'Tiers, billing, cancellation-safe flows',
  },
  {
    href: '/premium',
    label: 'Premium content',
    detail: 'Entitlement-aware previews and unlock options',
  },
  {
    href: '/sponsorships',
    label: 'Sponsorships',
    detail: 'Creator opportunities and sponsor workspace',
  },
  { href: '/mira/store', label: 'Creator store', detail: 'Digital products and purchase history' },
  { href: '/mira/membership', label: 'Membership', detail: 'Support a creator directly' },
] as const;

export function MonetizationHub() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Monetization</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Creator-first economy surfaces — transparent, calm, and free of dark patterns.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Surface bordered className="block h-full p-5 transition-colors hover:bg-elevated/30">
              <h2 className="text-sm font-medium text-fg">{link.label}</h2>
              <p className="mt-2 text-xs text-muted">{link.detail}</p>
            </Surface>
          </Link>
        ))}
      </div>
      <EntitlementStatePanel entitlements={demoEntitlements} />
    </div>
  );
}
