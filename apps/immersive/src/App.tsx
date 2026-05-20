'use client';

import {
  ImmersiveShell,
  DiscoveryRoom,
  WatchEnvironment,
  FocusAwareChrome,
} from '@next/immersive-ui';
import { SpatialShell, DepthNav, LayeredNav } from '@next/spatial-ui';
import { CalmSurface, ContextualOverlay } from '@next/environment-ui';
import { useEnvironmentStore, useImmersiveStore } from '@next/frontend-utils';
import { demoAmbientMedia, demoDiscoveryRails, demoSpatialNav } from './demo-immersive';

export function App() {
  const overlayVisible = useEnvironmentStore((s) => s.overlayVisible);
  const setOverlayVisible = useEnvironmentStore((s) => s.setOverlayVisible);
  const setMode = useImmersiveStore((s) => s.setMode);

  return (
    <SpatialShell>
      <ImmersiveShell>
        <FocusAwareChrome regionId="global">
          <div>
            <p className="text-xs uppercase tracking-wider text-subtle">NEXT Immersive</p>
            <h1 className="text-3xl font-semibold">Spatial &amp; ambient foundations</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-surface px-4 py-2 text-sm"
              onClick={() => {
                setMode('spatial');
                setOverlayVisible(!overlayVisible);
              }}
            >
              Toggle overlay
            </button>
          </div>
        </FocusAwareChrome>

        <div className="mx-auto max-w-6xl space-y-12 px-6 py-10">
          <DepthNav items={[...demoSpatialNav]} />

          <DiscoveryRoom
            hero={
              <div className="space-y-4">
                <h2 className="text-4xl font-semibold">{demoAmbientMedia.title}</h2>
                <p className="text-muted">by {demoAmbientMedia.creator}</p>
              </div>
            }
            rails={
              <ul className="grid gap-4 md:grid-cols-3">
                {demoDiscoveryRails.map((rail) => (
                  <li key={rail.id} className="rounded-xl border border-white/10 bg-surface/80 p-4">
                    <span className="text-xs text-brand">{rail.tag}</span>
                    <p className="mt-2 font-medium">{rail.title}</p>
                  </li>
                ))}
              </ul>
            }
          />

          <LayeredNav
            activeId="watch"
            onActiveChange={() => {}}
            layers={[
              {
                id: 'watch',
                label: 'Watch',
                content: (
                  <WatchEnvironment
                    viewport={
                      <div className="flex aspect-video items-center justify-center bg-black/80 text-muted">
                        Cinematic viewport placeholder
                      </div>
                    }
                    metadata={<p className="text-sm text-muted">Ambient playback metadata</p>}
                  />
                ),
              },
              {
                id: 'calm',
                label: 'Calm surface',
                content: (
                  <CalmSurface title="Ambient intelligence">Low-attention layer</CalmSurface>
                ),
              },
            ]}
          />

          <ContextualOverlay visible={overlayVisible} lowDistraction>
            <p className="text-sm">Contextual overlay — appears when needed, fades gracefully.</p>
          </ContextualOverlay>
        </div>
      </ImmersiveShell>
    </SpatialShell>
  );
}
