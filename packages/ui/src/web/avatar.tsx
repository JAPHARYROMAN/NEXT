import clsx from 'clsx';
import type { ImgHTMLAttributes } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  readonly name: string;
  readonly src?: string;
  readonly size?: AvatarSize;
}

const sizeClass: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, src, size = 'md', className, alt, ...rest }: AvatarProps) {
  const label = alt ?? name;

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={clsx('rounded-full object-cover bg-elevated', sizeClass[size], className)}
        {...rest}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-elevated font-medium text-fg',
        sizeClass[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
