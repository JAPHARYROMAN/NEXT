'use client';

import {
  CommunityHeader,
  CommunityIdentity,
  MemberPresence,
  JoinFlow,
  PinnedCreatorMessage,
  ActivityTimeline,
  MediaCollection,
  RitualBanner,
} from '@next/community-ui';
import { DiscussionThread, ThreadComposer } from '@next/social-ui';
import { CommunityHealth, ModerationTransparency, ReputationBadge } from '@next/reputation-ui';
import { CommunityRoom } from '@next/layout-engine';
import type { DemoCommunity } from '@/lib/demo-communities';
import { demoDiscussions, demoTimeline } from '@/lib/demo-communities';

const demoPresence = [
  { id: '1', label: 'Mira', status: 'active' as const },
  { id: '2', label: 'Sol', status: 'listening' as const },
  { id: '3', label: 'Kai', status: 'active' as const },
];

export function CommunityHome({ community }: { community: DemoCommunity }) {
  return (
    <CommunityRoom
      header={
        <CommunityHeader
          name={community.name}
          tagline={community.tagline}
          memberCount={community.memberCount}
          activeNow={community.activeNow}
          mood={community.mood === 'chaos' ? 'underground' : 'warm'}
          accentHue={community.accentHue}
        />
      }
      main={
        <div className="space-y-8">
          <CommunityIdentity
            avatarLabel={community.avatarLabel}
            tags={community.tags}
            accentLabel={`Hue ${community.accentHue}`}
          />
          <PinnedCreatorMessage
            creatorName="Circle keeper"
            message="Welcome — take your time. Thoughtful voices matter more than hot takes."
            postedAt="Pinned · this week"
          />
          <DiscussionThread
            title="Featured discussions"
            comments={demoDiscussions}
            showModeration
          />
          <ThreadComposer />
          <MediaCollection
            title="Shared collections"
            items={[
              { id: 'm1', title: 'Winter ambient', hue: community.accentHue },
              { id: 'm2', title: 'Community edits', hue: community.accentHue + 40 },
            ]}
          />
        </div>
      }
      aside={
        <div className="space-y-6">
          <JoinFlow communityName={community.name} />
          <MemberPresence members={demoPresence} />
          <RitualBanner
            title="Weekly listening ritual"
            scheduleLabel="Sundays · 8pm local"
            description="Gather calmly — no performance pressure."
          />
          <ActivityTimeline entries={demoTimeline} />
          <ReputationBadge score={78} tier="trusted" />
          <CommunityHealth score={88} signals={['Thoughtful tone', 'Low report volume']} />
          <ModerationTransparency actionsThisWeek={2} appealsOpen={0} />
        </div>
      }
    />
  );
}
