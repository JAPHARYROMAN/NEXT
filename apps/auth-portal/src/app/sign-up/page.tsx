'use client';

// Sign-up: registers a user via the api-gateway. Passkey enrollment lands in
// Phase 6; this collects a handle + display name and calls registerUser.

import { useState } from 'react';
import Link from 'next/link';
import { gql } from '@/lib/gateway';

interface RegisterData {
  registerUser: {
    user: { id: string; handle: string; displayName: string; tier: string };
  };
}

const REGISTER = /* GraphQL */ `
  mutation Register($input: RegisterUserInput!) {
    registerUser(input: $input) {
      user {
        id
        handle
        displayName
        tier
      }
    }
  }
`;

export default function SignUp() {
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<RegisterData['registerUser']['user'] | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await gql<RegisterData>(REGISTER, { input: { handle, displayName } });
      if (res.errors?.[0]) {
        setError(res.errors[0].message);
        return;
      }
      if (res.data) setDone(res.data.registerUser.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <h1 className="font-display text-h3">Welcome, @{done.handle}</h1>
        <p className="mt-2 text-muted text-small">Your account is ready.</p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block bg-brand text-white rounded-md px-4 py-2.5"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-h3 tracking-tight">Create your account</h1>
      <p className="mt-1 text-muted text-small">Pick a handle. It is yours across NEXT.</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-1">
          <span className="text-small text-muted">Handle</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            autoComplete="username"
            placeholder="lowercase, 3-30 chars"
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

        {error ? (
          <p className="text-danger text-small rounded-md border border-danger/40 bg-danger/10 px-3 py-2">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || handle.length < 3}
          className="bg-brand text-white rounded-md px-4 py-2.5 disabled:opacity-50 transition duration-quick"
        >
          {busy ? '…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-small text-muted text-center">
        Already have one?{' '}
        <Link href="/sign-in" className="text-brand">
          Sign in
        </Link>
      </p>
    </div>
  );
}
