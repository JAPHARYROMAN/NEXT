'use client';

import {
  StreamSetupForm,
  PreflightChecklist,
  IngestPlaceholders,
  GoLiveConfirmation,
} from '@next/broadcast-ui';
import { MediaViewport } from '@next/layout-engine';
import { StudioPageHeader } from '@next/studio-components';
import { useStreamSetupStore, trackLiveGoLiveFriction } from '@next/frontend-utils';
import { demoPreflight } from '@/lib/demo-broadcast';

export function StreamSetupExperience() {
  const title = useStreamSetupStore((s) => s.title);
  const description = useStreamSetupStore((s) => s.description);
  const visibility = useStreamSetupStore((s) => s.visibility);
  const scheduledAt = useStreamSetupStore((s) => s.scheduledAt);
  const readiness = useStreamSetupStore((s) => s.readiness);
  const setField = useStreamSetupStore((s) => s.setField);
  const setReadiness = useStreamSetupStore((s) => s.setReadiness);

  const draft = {
    title: title || 'Untitled live',
    description,
    visibility,
    ...(scheduledAt ? { scheduledAt } : {}),
  };

  return (
    <MediaViewport className="space-y-8">
      <StudioPageHeader
        title="Stream setup"
        subtitle="Clear readiness — no stress before go-live."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <StreamSetupForm
          draft={draft}
          onChange={(field, value) => {
            setField(field, value);
            trackLiveGoLiveFriction('edit_field', 'low');
          }}
        />
        <div className="space-y-4">
          <PreflightChecklist items={demoPreflight} />
          <IngestPlaceholders />
          <GoLiveConfirmation
            readiness={readiness === 'ready' ? 'ready' : 'preflight'}
            onConfirm={() => {
              setReadiness('ready');
              trackLiveGoLiveFriction('confirm_go_live', 'low');
            }}
            onCancel={() => trackLiveGoLiveFriction('cancel_go_live', 'low')}
          />
        </div>
      </div>
    </MediaViewport>
  );
}
