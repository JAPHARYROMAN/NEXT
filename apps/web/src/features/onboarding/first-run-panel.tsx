'use client';

import { FirstRunActivation } from '@next/onboarding-ui';
import { useFirstRunStore } from '@next/onboarding-ui/store';

export function FirstRunPanel() {
  const activated = useFirstRunStore((s) => s.activated);
  if (!activated) return null;
  return (
    <div className="mb-8">
      <FirstRunActivation />
    </div>
  );
}
