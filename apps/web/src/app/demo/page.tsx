'use client';

// Phase 4 demo: register a user via the api-gateway's GraphQL endpoint
// and render the materialized profile. Proves the end-to-end stack works
// from the browser. Replaced by the real auth flow in Phase 5.

import { useState } from 'react';

const GATEWAY_URL = process.env['NEXT_PUBLIC_GRAPHQL_URL'] ?? 'http://localhost:14000/graphql';

interface User {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  tier: 'AUTHENTICATED' | 'CREATOR' | 'PARTNER' | 'STAFF';
  followers: number;
  following: number;
  createdAt: string;
}

interface GraphQLError {
  message: string;
}

interface RegisterResponse {
  data?: { registerUser: { user: User } };
  errors?: GraphQLError[];
}

interface UserResponse {
  data?: { user: User | null };
  errors?: GraphQLError[];
}

const REGISTER_MUTATION = /* GraphQL */ `
  mutation Register($input: RegisterUserInput!) {
    registerUser(input: $input) {
      user {
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
  }
`;

const USER_QUERY = /* GraphQL */ `
  query Me($id: ID!) {
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

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const resp = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return resp.json() as Promise<T>;
}

function defaultHandle() {
  const r = Math.floor(Math.random() * 1_000_000);
  return `web_${r}`;
}

export default function Demo() {
  const [handle, setHandle] = useState(defaultHandle());
  const [displayName, setDisplayName] = useState('Web Demo');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onRegister() {
    setBusy(true);
    setError(null);
    setUser(null);
    try {
      const resp = await gql<RegisterResponse>(REGISTER_MUTATION, {
        input: { handle, displayName },
      });
      if (resp.errors?.[0]) {
        setError(resp.errors[0].message);
        return;
      }
      if (resp.data) setUser(resp.data.registerUser.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onRefetch() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const resp = await gql<UserResponse>(USER_QUERY, { id: user.id });
      if (resp.errors?.[0]) {
        setError(resp.errors[0].message);
        return;
      }
      if (resp.data?.user) setUser(resp.data.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-h1 tracking-tight">Phase 4 demo</h1>
      <p className="mt-3 text-muted">
        Browser → api-gateway → auth-service + profile-service. The bus materializes the profile
        asynchronously.
      </p>

      <div className="mt-10 grid gap-4">
        <label className="grid gap-1">
          <span className="text-small text-muted">Handle</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="bg-elevated text-fg rounded-md px-3 py-2 border border-subtle/30 outline-none focus:border-brand"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-small text-muted">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-elevated text-fg rounded-md px-3 py-2 border border-subtle/30 outline-none focus:border-brand"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRegister}
            disabled={busy || !handle}
            className="bg-brand text-white px-4 py-2 rounded-md disabled:opacity-50 transition duration-quick"
          >
            {busy ? '…' : 'Register'}
          </button>
          <button
            type="button"
            onClick={onRefetch}
            disabled={!user || busy}
            className="bg-elevated text-fg px-4 py-2 rounded-md border border-subtle/30 disabled:opacity-50 transition duration-quick"
          >
            Refetch profile
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-8 rounded-md border border-danger/50 bg-danger/10 text-danger px-4 py-3 text-small">
          {error}
        </div>
      ) : null}

      {user ? (
        <section className="mt-8 rounded-lg bg-surface border border-subtle/20 p-6">
          <h2 className="font-display text-h3">@{user.handle}</h2>
          <p className="text-fg mt-1">{user.displayName}</p>
          <dl className="mt-4 grid grid-cols-2 gap-y-2 text-small">
            <dt className="text-muted">id</dt>
            <dd className="font-mono break-all">{user.id}</dd>
            <dt className="text-muted">tier</dt>
            <dd>{user.tier}</dd>
            <dt className="text-muted">followers</dt>
            <dd>{user.followers}</dd>
            <dt className="text-muted">following</dt>
            <dd>{user.following}</dd>
            <dt className="text-muted">createdAt</dt>
            <dd className="font-mono">{user.createdAt}</dd>
          </dl>
        </section>
      ) : null}
    </main>
  );
}
