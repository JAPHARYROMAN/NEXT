'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { MediaViewport } from '@next/layout-engine';
import { LiveEventLayout } from '@next/layout-engine';
import { LiveCountdown } from '@next/live-ui';
import { Badge, MediaCard, Surface } from '@next/ui';
import { DiscussionShell } from '@next/interaction-ui';
import { trackLiveEventConversion } from '@next/frontend-utils';
import { useLiveCountdownStore } from '@next/frontend-utils';
import { demoLiveEvents } from '@/lib/demo-live';

export interface LiveEventsExperienceProps {
  readonly eventId?: string;
}

export function LiveEventsExperience({ eventId }: LiveEventsExperienceProps) {
  const event = demoLiveEvents.find((e) => e.id === eventId) ?? demoLiveEvents[0]!;
  const startsInSec = useLiveCountdownStore((s) =>
    s.eventId === event.id ? s.startsInSec : event.startsInSec,
  );
  const setEvent = useLiveCountdownStore((s) => s.setEvent);
  const tick = useLiveCountdownStore((s) => s.tick);
  const reminderSet = useLiveCountdownStore((s) => s.reminderSet);
  const setReminder = useLiveCountdownStore((s) => s.setReminder);

  useEffect(() => {
    setEvent(event.id, event.startsInSec);
    trackLiveEventConversion(event.id, 'view');
  }, [event.id, event.startsInSec, setEvent]);

  useEffect(() => {
    if (startsInSec <= 0) return;
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [startsInSec, tick]);

  return (
    <MediaViewport className="space-y-10">
      <LiveEventLayout
        hero={
          <LiveCountdown
            title={event.title}
            startsInSec={startsInSec}
            {...(event.premiere ? { premiere: true } : {})}
          />
        }
        stage={
          <Surface bordered className="p-6">
            <p className="text-sm text-muted">{event.creator}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {event.highlights.map((h) => (
                <li key={h}>· {h}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg border border-subtle/20 px-4 py-2 text-sm"
                onClick={() => {
                  setReminder(!reminderSet);
                  trackLiveEventConversion(event.id, 'reminder');
                }}
              >
                {reminderSet ? 'Reminder set' : 'Set reminder'}
              </button>
              {event.streamId ? (
                <Link
                  href={`/live/${event.streamId}`}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
                  onClick={() => trackLiveEventConversion(event.id, 'join_live')}
                >
                  Join when live
                </Link>
              ) : null}
            </div>
          </Surface>
        }
        discussion={<DiscussionShell title="Event discussion" placeholderCount={4} />}
      />

      <section aria-label="Upcoming events">
        <h2 className="font-display text-lg font-medium">Upcoming</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {demoLiveEvents.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`}>
              <Surface bordered className="p-4 transition-colors hover:bg-surface/40">
                <Badge tone="accent">{e.premiere ? 'Premiere' : 'Scheduled'}</Badge>
                <p className="mt-2 font-medium">{e.title}</p>
                <p className="text-sm text-muted">{e.creator}</p>
              </Surface>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Post-event replays">
        <h2 className="font-display text-lg font-medium">Past events</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <MediaCard
            id="replay-1"
            title="Archive — sunrise set"
            creator="@vault"
            href="/live/live-ended"
            thumbnailHue={40}
          />
        </div>
      </section>
    </MediaViewport>
  );
}
