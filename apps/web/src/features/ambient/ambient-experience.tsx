'use client';

import { ImmersiveShell, WatchEnvironment } from '@next/immersive-ui';
import {
  AmbientEnvironment,
  CalmSurface,
  ContextualOverlay,
  PlaybackAtmosphere,
} from '@next/environment-ui';
import {
  trackImmersiveEngagement,
  useAmbientPlaybackStore,
  useEnvironmentStore,
  useImmersiveStore,
} from '@next/frontend-utils';
import { useEffect } from 'react';
import { demoAmbientInsights, demoAmbientSessions } from '@/lib/demo-ambient';

export function AmbientExperience() {
  const setMode = useImmersiveStore((s) => s.setMode);
  const setLowDistraction = useImmersiveStore((s) => s.setLowDistraction);
  const overlayVisible = useEnvironmentStore((s) => s.overlayVisible);
  const setOverlayVisible = useEnvironmentStore((s) => s.setOverlayVisible);
  const setMood = useEnvironmentStore((s) => s.setMood);
  const setPlaying = useAmbientPlaybackStore((s) => s.setPlaying);

  useEffect(() => {
    setMode('ambient');
    trackImmersiveEngagement('ambient', 'ambient', 'enter');
  }, [setMode]);

  return (
    <AmbientEnvironment variant="cool" mood="calm">
      <ImmersiveShell>
        <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-subtle">Ambient</p>
            <h1 className="text-3xl font-semibold">Calm playback environments</h1>
            <p className="text-muted">
              Appear when needed, disappear gracefully — emotionally adaptive, never shouty.
            </p>
          </header>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-surface px-4 py-2 text-sm"
              onClick={() => setOverlayVisible(!overlayVisible)}
            >
              Toggle contextual overlay
            </button>
            <button
              type="button"
              className="rounded-full bg-surface px-4 py-2 text-sm"
              onClick={() => setLowDistraction(true)}
            >
              Low distraction
            </button>
          </div>

          <ul className="space-y-4">
            {demoAmbientSessions.map((session) => (
              <li key={session.id}>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-white/10 bg-surface/80 p-6 text-left"
                  onClick={() => {
                    setMood(session.mood);
                    setPlaying(true);
                  }}
                >
                  <h2 className="text-xl font-semibold">{session.title}</h2>
                  <p className="mt-2 text-sm text-muted">{session.description}</p>
                </button>
              </li>
            ))}
          </ul>

          <WatchEnvironment
            viewport={
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-black">
                <PlaybackAtmosphere active className="opacity-60" />
                <span className="relative z-10 text-muted">Ambient playback viewport</span>
              </div>
            }
            metadata={
              <p className="text-sm text-muted">
                Environmental playback — frontend placeholders only
              </p>
            }
          />

          <CalmSurface title="Ambient intelligence">
            <ul className="list-disc space-y-1 pl-4">
              {demoAmbientInsights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CalmSurface>

          <ContextualOverlay visible={overlayVisible} lowDistraction>
            <p className="text-sm">
              Contextual information layer — contrast-safe, reduced motion aware.
            </p>
          </ContextualOverlay>
        </div>
      </ImmersiveShell>
    </AmbientEnvironment>
  );
}
