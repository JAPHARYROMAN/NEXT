'use client';

import Link from 'next/link';
import { StudioPageHeader } from '@next/studio-components';
import { Surface, Badge } from '@next/ui';

const events = [
  { id: 'evt-premiere', title: 'Premiere — Field recordings vol. 2', when: 'In 62 min' },
  { id: 'evt-community', title: 'Community listening room', when: 'In 15 min' },
] as const;

export function LiveEventsStudio() {
  return (
    <div className="space-y-8">
      <StudioPageHeader title="Live events" subtitle="Scheduled premieres and community stages." />
      <ul className="space-y-4">
        {events.map((e) => (
          <li key={e.id}>
            <Surface bordered className="flex items-center justify-between p-4">
              <div>
                <Badge tone="accent">Scheduled</Badge>
                <p className="mt-2 font-medium">{e.title}</p>
                <p className="text-sm text-muted">{e.when}</p>
              </div>
              <Link href={`/live/control-room`} className="text-sm text-accent">
                Open control room
              </Link>
            </Surface>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">
        Viewer event pages:{' '}
        <a href="http://localhost:3000/events" className="text-accent">
          /events
        </a>{' '}
        (web app)
      </p>
    </div>
  );
}
