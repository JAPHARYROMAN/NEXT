// Profile view. Phase 6: identified by a `uid` query param handed over from
// auth-portal. Phase 7 swaps this for the verified JWT subject claim.

import { gql } from '@/lib/gateway';

interface UserData {
  user: {
    id: string;
    handle: string;
    displayName: string;
    bio: string;
    tier: string;
    followers: number;
    following: number;
    createdAt: string;
  } | null;
}

const USER_QUERY = /* GraphQL */ `
  query Profile($id: ID!) {
    user(id: $id) {
      id
      handle
      displayName
      bio
      tier
      followers
      following
      createdAt
    }
  }
`;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string }>;
}) {
  const { uid } = await searchParams;

  if (!uid) {
    return (
      <p className="text-muted">
        No account selected. Sign in through the auth portal to continue.
      </p>
    );
  }

  const res = await gql<UserData>(USER_QUERY, { id: uid });
  const user = res.data?.user;

  if (res.errors?.[0] || !user) {
    return <p className="text-danger">{res.errors?.[0]?.message ?? 'Account not found.'}</p>;
  }

  return (
    <section>
      <h1 className="font-display text-h2">@{user.handle}</h1>
      <p className="mt-1 text-fg">{user.displayName}</p>
      {user.bio ? <p className="mt-2 text-muted text-small">{user.bio}</p> : null}

      <dl className="mt-8 grid grid-cols-2 gap-y-3 text-small max-w-md">
        <dt className="text-muted">Account id</dt>
        <dd className="font-mono break-all">{user.id}</dd>
        <dt className="text-muted">Tier</dt>
        <dd>{user.tier}</dd>
        <dt className="text-muted">Followers</dt>
        <dd>{user.followers}</dd>
        <dt className="text-muted">Following</dt>
        <dd>{user.following}</dd>
        <dt className="text-muted">Joined</dt>
        <dd className="font-mono">{user.createdAt}</dd>
      </dl>
    </section>
  );
}
