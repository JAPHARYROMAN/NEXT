import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:opacity-90 active:opacity-95',
  secondary: 'bg-elevated text-fg hover:bg-surface border border-subtle/30',
  ghost: 'bg-transparent text-fg hover:bg-elevated',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-base rounded-md',
  lg: 'h-12 px-6 text-lg rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={(disabled ?? false) || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium select-none transition duration-quick ease-cinematic',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <span className="animate-pulse">…</span> : children}
    </button>
  );
});
