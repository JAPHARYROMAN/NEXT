'use client';

import Link from 'next/link';
import { OnboardingShell, FieldGroup } from '@next/identity-ui';
import { Surface } from '@next/ui';
import { useCreatorOnboardingStore } from './store/creator-onboarding-store';
import { useFirstRunStore, CREATOR_SUGGESTIONS } from './store/first-run-store';

export function StudioCreatorSetup() {
  const categories = useCreatorOnboardingStore((s) => s.categories);
  const audienceGoal = useCreatorOnboardingStore((s) => s.audienceGoal);
  const checklist = useFirstRunStore((s) => s.checklistComplete);

  return (
    <OnboardingShell
      title="Creator setup"
      subtitle="Profile checklist, audience tips, and dashboard preview."
      routeKey="studio-creator-setup"
    >
      <div className="space-y-6">
        <Surface bordered className="p-5">
          <FieldGroup legend="Profile checklist">
            <ul className="space-y-2 text-sm">
              {['Identity', 'Categories', 'Audience goal', 'First upload'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    className={checklist.length > 0 ? 'text-accent' : 'text-muted'}
                    aria-hidden="true"
                  >
                    ○
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </FieldGroup>
        </Surface>

        <Surface bordered className="p-5 text-sm">
          <p className="font-medium text-fg">Content focus</p>
          <p className="mt-1 text-muted">
            {categories.length > 0
              ? categories.join(', ')
              : 'Set categories in web creator onboarding.'}
          </p>
          <p className="mt-4 font-medium text-fg">Audience tips</p>
          <p className="mt-1 text-muted">
            {audienceGoal || 'Describe who you create for — shapes discovery placement.'}
          </p>
        </Surface>

        <Surface bordered className="p-5">
          <p className="text-sm font-medium text-fg">Dashboard preview</p>
          <p className="mt-2 text-sm text-muted">
            Analytics, uploads, and live health panels — open the studio home when ready.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg"
          >
            Studio home (demo)
          </Link>
        </Surface>

        <ul className="space-y-2 text-sm">
          {CREATOR_SUGGESTIONS.map((s) => (
            <li key={s.id}>
              <a href={s.href} className="text-accent hover:underline">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </OnboardingShell>
  );
}
