import Link from 'next/link';
import { StudioPageHeader } from '@next/studio-components';
import { Surface } from '@next/ui';

const links = [
  { href: '/live/control-room', label: 'Control room', desc: 'Broadcast dashboard & moderation' },
  { href: '/live/events', label: 'Events', desc: 'Scheduled premieres' },
  { href: '/live/setup', label: 'Stream setup', desc: 'Preflight & go-live' },
] as const;

export default function LiveHubPage() {
  return (
    <div className="space-y-8">
      <StudioPageHeader title="Live" subtitle="Creator broadcast hub." />
      <ul className="grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>
              <Surface bordered className="block p-5 transition-colors hover:bg-surface/40">
                <p className="font-medium">{l.label}</p>
                <p className="mt-1 text-sm text-muted">{l.desc}</p>
              </Surface>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
