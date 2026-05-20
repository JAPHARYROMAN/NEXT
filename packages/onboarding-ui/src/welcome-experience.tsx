'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { motionSafe, panelVariants, useReducedMotion } from '@next/animation-system';
import { Surface, Button } from '@next/ui';
import clsx from 'clsx';
import { useOnboardingStore } from './store/onboarding-store';
import { trackOnboardingStep } from './telemetry';
import type { OnboardingPath } from './types';

export interface WelcomeExperienceProps {
  readonly className?: string;
}

export function WelcomeExperience({ className }: WelcomeExperienceProps) {
  const reduced = useReducedMotion();
  const completeWelcome = useOnboardingStore((s) => s.completeWelcome);
  const setPath = useOnboardingStore((s) => s.setPath);
  const variants = motionSafe(panelVariants, reduced);

  const choosePath = (path: OnboardingPath) => {
    setPath(path);
    completeWelcome();
    trackOnboardingStep('welcome_path', { path });
  };

  return (
    <section className={clsx('mx-auto max-w-2xl space-y-10', className)}>
      <motion.header
        initial={reduced ? false : 'initial'}
        animate="animate"
        variants={variants}
        className="space-y-4 text-center sm:text-left"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted">NEXT ecosystem</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          A calm place to discover, create, and belong
        </h1>
        <p className="mx-auto max-w-xl text-sm text-muted sm:mx-0">
          No urgency timers. No dark patterns. Choose how you want to begin — you can change
          everything later.
        </p>
      </motion.header>

      <div className="grid gap-4 sm:grid-cols-2">
        <PathCard
          title="Explore & watch"
          detail="Personalized feed, discovery, communities — chaos optional."
          onSelect={() => choosePath('viewer')}
          href="/onboarding"
        />
        <PathCard
          title="Create & publish"
          detail="Studio tools, audience goals, monetization when you are ready."
          onSelect={() => choosePath('creator')}
          href="/creator/onboarding"
        />
      </div>

      <p className="text-center text-xs text-muted sm:text-left">
        Already have a session?{' '}
        <Link href="/auth" className="text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}

function PathCard({
  title,
  detail,
  onSelect,
  href,
}: {
  readonly title: string;
  readonly detail: string;
  readonly onSelect: () => void;
  readonly href: string;
}) {
  return (
    <Surface bordered className="flex h-full flex-col p-6">
      <h2 className="text-lg font-medium text-fg">{title}</h2>
      <p className="mt-2 flex-1 text-sm text-muted">{detail}</p>
      <Link href={href} className="mt-6 block" onClick={onSelect}>
        <Button className="w-full">Continue</Button>
      </Link>
    </Surface>
  );
}
