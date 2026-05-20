'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { AmbientEnvironment } from '@next/environment-ui';
import { useImmersiveStore, useRenderTelemetry } from '@next/frontend-utils';
import type { AmbientLightVariant } from '@next/design-system';

export interface ImmersiveShellProps {
  readonly children: ReactNode;
  readonly ambientVariant?: AmbientLightVariant;
  readonly className?: string;
}

export function ImmersiveShell({
  children,
  ambientVariant = 'cinematic',
  className,
}: ImmersiveShellProps) {
  useRenderTelemetry('ImmersiveShell');
  const mode = useImmersiveStore((s) => s.mode);
  const lowDistraction = useImmersiveStore((s) => s.lowDistraction);

  return (
    <AmbientEnvironment
      variant={ambientVariant}
      mood={mode === 'ambient' ? 'calm' : 'focused'}
      className={clsx(lowDistraction && 'immersive-low-distraction', className)}
    >
      <div data-immersive-mode={mode}>{children}</div>
    </AmbientEnvironment>
  );
}
