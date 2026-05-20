'use client';

import { Surface, Button } from '@next/ui';
import { useAuthStore } from '@next/frontend-utils';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  const demoSignIn = () => {
    setSession(
      { id: 'demo', handle: 'you', displayName: 'You' },
      {
        accessToken: 'demo',
        refreshToken: 'demo',
        expiresAt: Date.now() + 3_600_000,
      },
    );
    router.push('/home');
  };

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        OIDC via @next/auth-sdk when identity service is connected.
      </p>
      <Surface bordered className="mt-8 space-y-4 p-6">
        <Button className="w-full" onClick={demoSignIn}>
          Continue with demo session
        </Button>
      </Surface>
    </section>
  );
}
