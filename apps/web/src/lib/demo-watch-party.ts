import type { PresenceMember } from '@next/community-ui';
import type { ThreadComment } from '@next/social-ui';

export interface DemoWatchParty {
  readonly id: string;
  readonly title: string;
  readonly host: string;
  readonly mediaLabel: string;
  readonly participants: readonly PresenceMember[];
}

export const demoWatchParties: readonly DemoWatchParty[] = [
  {
    id: 'premiere-aurora',
    title: 'Community premiere — Aurora cuts',
    host: 'Jordan',
    mediaLabel: "Aurora — Director's cut",
    participants: [
      { id: 'p1', label: 'Alex', status: 'active' },
      { id: 'p2', label: 'Sam', status: 'listening' },
      { id: 'p3', label: 'Riley', status: 'active' },
    ],
  },
  {
    id: 'late-lounge',
    title: 'Late lounge sync',
    host: 'Morgan',
    mediaLabel: 'Ambient session vol. 2',
    participants: [
      { id: 'p4', label: 'Casey', status: 'active' },
      { id: 'p5', label: 'Dev', status: 'away' },
    ],
  },
] as const;

export function getWatchPartyById(id: string): DemoWatchParty | undefined {
  return demoWatchParties.find((p) => p.id === id);
}

export const demoPostWatchComments: readonly ThreadComment[] = [
  {
    id: 'pw1',
    author: 'Alex',
    body: 'That final scene — still resonating.',
    time: 'Just now',
  },
];
