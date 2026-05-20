'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface FieldGroupProps {
  readonly legend: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly error?: string | undefined;
  readonly className?: string;
  readonly required?: boolean;
}

export function FieldGroup({
  legend,
  description,
  children,
  error,
  className,
  required,
}: FieldGroupProps) {
  const legendId = `${legend.replace(/\s+/g, '-').toLowerCase()}-legend`;

  return (
    <fieldset
      className={clsx('space-y-3', className)}
      aria-describedby={description ? `${legendId}-desc` : undefined}
    >
      <legend id={legendId} className="text-sm font-medium text-fg">
        {legend}
        {required ? <span className="text-muted"> (required)</span> : null}
      </legend>
      {description ? (
        <p id={`${legendId}-desc`} className="text-sm text-muted">
          {description}
        </p>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
