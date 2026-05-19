import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

type Elevation = 'flat' | 'e1' | 'e2' | 'e3' | 'cinematic';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  readonly elevation?: Elevation;
  readonly bordered?: boolean;
}

const shadowFor: Record<Elevation, string> = {
  flat: '',
  e1: 'shadow-elevation1',
  e2: 'shadow-elevation2',
  e3: 'shadow-elevation3',
  cinematic: 'shadow-cinematic',
};

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { elevation = 'flat', bordered, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        'bg-surface text-fg rounded-lg',
        bordered && 'border border-subtle/20',
        shadowFor[elevation],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
