'use client';

// Sign-in. Phase 6 covers the credential ceremony (passkey / password) end to
// end. For now this resolves a handle to its account via the gateway's `user`
// query — proving the portal ↔ gateway path — and hands off to account-center.

import { useState } from 'react';
import Link from 'next/link';
import { gql } from '@/lib/gateway';

interface UserData {
  user: { id: string; handle: string; displayName: string; tier: string } | null;
}

const LOOKUP = /* GraphQL */ `
  query Lookup($id: ID!) {
    user(id: $id) {
      id
      handle
      displayName
      tier
    }
  }
`;

const ACCOUNT_CENTER_URL = process.env['NEXT_PUBLIC_ACCOUNT_CENTER_URL'] ?? 'http://localhost:3060';

export default function SignIn() {
  const [userId, setUserId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await gql<UserData>(LOOKUP, { id: userId.trim() });
      if (res.errors?.[0]) {
        setError(res.errors[0].message);
        return;
      }
      if (!res.data?.user) {
        setError('No account found for that id.');
        return;
      }
      window.location.href = `${ACCOUNT_CENTER_URL}/profile?uid=${res.data.user.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-h3 tracking-tight">Sign in</h1>
      <p className="mt-1 text-muted text-small">
        Passkey sign-in arrives in Phase 6. Enter your account id to continue.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-1">
          <span className="text-small text-muted">Account id</span>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="uuid"
            className="bg-elevated text-fg rounded-md px-3 py-2 border border-subtle/30 outline-none focus:border-brand font-mono text-small"
          />
        </label>

        {error ? (
          <p className="text-danger text-small rounded-md border border-danger/40 bg-danger/10 px-3 py-2">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || userId.trim().length === 0}
          className="bg-brand text-white rounded-md px-4 py-2.5 disabled:opacity-50 transition duration-quick"
        >
          {busy ? '…' : 'Continue'}
        </button>
      </form>

      <p className="mt-6 text-small text-muted text-center">
        New here?{' '}
        <Link href="/sign-up" className="text-brand">
          Create an account
        </Link>
      </p>
    </div>
  );
}
