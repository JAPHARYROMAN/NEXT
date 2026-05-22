'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { focusRing } from '@next/design-system';
import { fullscreenVariants, useReducedMotion } from '@next/animation-system';
import { trackMobileNavTiming, useMobileNavigationStore } from '@next/frontend-utils';
import type { IconProps } from '@next/icons';

export interface AdaptiveNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: ComponentType<IconProps>;
}

export interface AdaptiveBottomNavProps {
  readonly items: readonly AdaptiveNavItem[];
  readonly maxVisible?: number;
}

export function AdaptiveBottomNav({ items, maxVisible = 5 }: AdaptiveBottomNavProps) {
  const pathname = usePathname();
  const navState = useMobileNavigationStore((s) => s.state);
  const reduced = useReducedMotion();
  const visible = items.slice(0, maxVisible);

  if (navState === 'hidden') return null;

  return (
    <motion.nav
      aria-label="Mobile primary navigation"
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-subtle/15 bg-surface/95 backdrop-blur-md',
        'pb-[env(safe-area-inset-bottom)] lg:hidden',
        navState === 'fullscreen' && 'translate-y-full opacity-0 pointer-events-none',
      )}
      variants={fullscreenVariants}
      initial={false}
      animate={navState === 'fullscreen' ? 'exit' : 'animate'}
      transition={{ duration: reduced ? 0 : 0.28 }}
    >
      <ul className="flex items-stretch justify-around px-2 py-2">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={clsx(
                  'flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium',
                  focusRing,
                  active ? 'text-brand' : 'text-muted',
                )}
                onClick={() => {
                  const start = performance.now();
                  requestAnimationFrame(() =>
                    trackMobileNavTiming(item.href, Math.round(performance.now() - start)),
                  );
                }}
              >
                <Icon size={22} aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
