'use client';

import { useEffect } from 'react';
import { DownloadManager, OfflineDraftShell } from '@next/offline-ui';
import { MobileExperienceShell } from './mobile-experience-shell';
import { initOfflineDemo } from './init-offline-demo';

export function MobileOfflinePage() {
  useEffect(() => initOfflineDemo(), []);
  return (
    <MobileExperienceShell title="Offline">
      <div className="space-y-8 px-4 py-6">
        <DownloadManager />
        <OfflineDraftShell />
      </div>
    </MobileExperienceShell>
  );
}
