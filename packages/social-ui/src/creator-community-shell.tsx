'use client';

import clsx from 'clsx';
import {
  CommunityHeader,
  PinnedCreatorMessage,
  RitualBanner,
  MediaCollection,
  type TimelineEntry,
  ActivityTimeline,
} from '@next/community-ui';
import { TrustedContributorBadge, CreatorVerification } from '@next/reputation-ui';
import { DiscussionThread, type ThreadComment } from './discussion-thread';
import { ThreadComposer } from './thread-composer';

export interface CreatorCommunityShellProps {
  readonly creatorName: string;
  readonly handle: string;
  readonly memberCount: string;
  readonly activeNow?: number;
  readonly pinnedMessage?: string;
  readonly ritual?: { title: string; schedule: string; description?: string };
  readonly timeline?: readonly TimelineEntry[];
  readonly discussions?: readonly ThreadComment[];
  readonly premiumLabel?: string;
  readonly className?: string;
}

export function CreatorCommunityShell({
  creatorName,
  handle,
  memberCount,
  activeNow,
  pinnedMessage,
  ritual,
  timeline = [],
  discussions = [],
  premiumLabel = 'Premium member lounge',
  className,
}: CreatorCommunityShellProps) {
  return (
    <div className={clsx('space-y-8', className)}>
      <CommunityHeader
        name={`${creatorName}'s circle`}
        tagline={`Fan discussions, announcements, and rituals — @${handle}`}
        memberCount={memberCount}
        {...(activeNow != null ? { activeNow } : {})}
        mood="warm"
        accentHue={260}
      />
      <div className="flex flex-wrap gap-2">
        <CreatorVerification verified label="Verified creator" />
        <TrustedContributorBadge label="Trusted circle" />
      </div>
      {pinnedMessage ? (
        <PinnedCreatorMessage
          creatorName={creatorName}
          message={pinnedMessage}
          postedAt="Pinned · today"
        />
      ) : null}
      {ritual ? (
        <RitualBanner
          title={ritual.title}
          scheduleLabel={ritual.schedule}
          {...(ritual.description ? { description: ritual.description } : {})}
        />
      ) : null}
      <section className="rounded-xl border border-subtle/15 p-4" aria-label={premiumLabel}>
        <h3 className="text-sm font-medium text-accent">{premiumLabel}</h3>
        <p className="mt-1 text-xs text-muted">Member perks shell — billing API pending.</p>
      </section>
      <MediaCollection
        title="Media wall"
        items={[
          { id: '1', title: 'Behind the scenes', hue: 200 },
          { id: '2', title: 'Live cut', hue: 280 },
        ]}
      />
      <section
        aria-label="Q&A shell"
        className="rounded-xl border border-dashed border-subtle/20 p-4"
      >
        <h3 className="text-sm font-medium">Q&A</h3>
        <p className="mt-1 text-xs text-muted">Ask the creator — queue API pending.</p>
      </section>
      <section
        aria-label="Events shell"
        className="rounded-xl border border-dashed border-subtle/20 p-4"
      >
        <h3 className="text-sm font-medium">Upcoming events</h3>
        <p className="mt-1 text-xs text-muted">Premieres and rituals — calendar API pending.</p>
      </section>
      {timeline.length > 0 ? <ActivityTimeline entries={timeline} /> : null}
      <DiscussionThread title="Fan discussion" comments={discussions} showModeration />
      <ThreadComposer />
    </div>
  );
}
