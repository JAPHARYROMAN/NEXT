'use client';

import { useEffect, useId, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { focusRingVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { useFocusContext } from './focus-context';

export interface FocusableProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  readonly focusId?: string;
  readonly row: number;
  readonly col: number;
  readonly zone?: string;
  readonly className?: string;
}

export function Focusable({
  children,
  focusId,
  row,
  col,
  zone,
  className,
  onClick,
  type = 'button',
  ...rest
}: FocusableProps) {
  const autoId = useId();
  const id = focusId ?? autoId;
  const ref = useRef<HTMLButtonElement>(null);
  const { focusedId, register, unregister, focus } = useFocusContext();
  const reduced = useReducedMotion();
  const active = focusedId === id;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    register({ id, row, col, ...(zone ? { zone } : {}) }, el);
    return () => unregister(id);
  }, [col, id, register, row, unregister, zone]);

  return (
    <motion.div
      variants={motionSafe(focusRingVariants, reduced)}
      animate={active ? 'focused' : 'idle'}
      className="inline-block"
    >
      <button
        ref={ref}
        type={type}
        data-focus-id={id}
        data-focused={active ? 'true' : 'false'}
        aria-current={active ? 'true' : undefined}
        tabIndex={active ? 0 : -1}
        className={clsx(
          'relative min-h-[3.25rem] min-w-[3.25rem] rounded-2xl px-5 py-3 text-left text-lg',
          'outline-none transition-colors duration-300',
          active
            ? 'ring-2 ring-accent/80 ring-offset-2 ring-offset-bg shadow-[0_0_32px_rgba(120,180,255,0.25)]'
            : 'ring-1 ring-subtle/20 hover:ring-subtle/40',
          className,
        )}
        onFocus={() => focus(id)}
        onClick={(e) => {
          focus(id);
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </button>
    </motion.div>
  );
}
