'use client';

import { ImmersiveShell, DiscoveryRoom, FocusAwareChrome } from '@next/immersive-ui';
import { SpatialShell, DepthNav, SpatialPanel } from '@next/spatial-ui';
import { FocusSensitiveLayout } from '@next/layout-engine';
import { SpatialNavBridge } from '@next/navigation-ui';
import {
  trackImmersiveEngagement,
  useImmersiveStore,
  useFocusLayoutStore,
} from '@next/frontend-utils';
import { useEffect } from 'react';
import { demoSpatialNav, demoSpatialRooms } from '@/lib/demo-spatial';

export function SpatialExperience() {
  const setMode = useImmersiveStore((s) => s.setMode);
  const setFocusRegion = useFocusLayoutStore((s) => s.setFocusRegion);

  useEffect(() => {
    setMode('spatial');
    trackImmersiveEngagement('spatial', 'spatial', 'enter');
  }, [setMode]);

  return (
    <SpatialShell>
      <ImmersiveShell ambientVariant="cinematic">
        <FocusAwareChrome regionId="global">
          <div>
            <p className="text-xs uppercase tracking-wider text-subtle">Spatial</p>
            <h1 className="text-3xl font-semibold">Depth-aware discovery</h1>
          </div>
        </FocusAwareChrome>

        <div className="mx-auto max-w-6xl space-y-10 px-6 py-8">
          <SpatialNavBridge
            items={[...demoSpatialNav]}
            onSelect={(id) => setFocusRegion(id)}
            trailing={
              <DiscoveryRoom
                hero={
                  <SpatialPanel title="Spatial room">
                    <p className="text-muted">
                      Future-ready navigation for AR/VR displays — modular, optional, no runtime
                      required.
                    </p>
                  </SpatialPanel>
                }
                rails={
                  <FocusSensitiveLayout
                    regions={demoSpatialRooms.map((room) => ({
                      id: room.id,
                      content: (
                        <div>
                          <span className="text-xs text-brand">{room.tag}</span>
                          <h3 className="mt-2 text-lg font-semibold">{room.title}</h3>
                          <p className="mt-2 text-sm text-muted">{room.description}</p>
                        </div>
                      ),
                    }))}
                  />
                }
              />
            }
          />
          <DepthNav items={[...demoSpatialNav]} />
        </div>
      </ImmersiveShell>
    </SpatialShell>
  );
}
