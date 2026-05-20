'use client';

import { ChaosPortal } from '@next/discovery-ui';
import { trackChaosEntry, trackDiscoveryEngagement } from '@next/frontend-utils';
import { useEffect } from 'react';
import { demoChaosExtended } from '@/lib/demo-trends';

export function ChaosExperience() {
  useEffect(() => {
    trackChaosEntry('chaos_page');
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <ChaosPortal items={demoChaosExtended} title="Chaos mode" />
      <p className="text-center text-sm text-muted">
        Discovery without optimization —{' '}
        <button
          type="button"
          className="text-accent hover:underline"
          onClick={() => trackDiscoveryEngagement('chaos', 'shuffle')}
        >
          shuffle again
        </button>
      </p>
    </div>
  );
}
