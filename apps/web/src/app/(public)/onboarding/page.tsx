import { Surface, Button } from '@next/ui';
import Link from 'next/link';

export const metadata = { title: 'Onboarding' };

export default function OnboardingPage() {
  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Welcome to NEXT</h1>
      <p className="mt-4 text-muted">
        A short, calm onboarding — no dark patterns, no urgency timers.
      </p>
      <Surface bordered className="mt-8 space-y-4 p-6">
        <p className="text-sm">
          Choose what you want to feel first: discovery, creation, or community.
        </p>
        <Link href="/auth">
          <Button className="w-full">Continue</Button>
        </Link>
      </Surface>
    </section>
  );
}
