'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ComponentType } from 'react';
import { focusRing } from '@next/design-system';
import type { IconProps } from '@next/icons';

export interface MobileNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: ComponentType<IconProps>;
}

export interface MobileNavProps {
  readonly items: readonly MobileNavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-subtle/15 bg-surface/95 backdrop-blur-md lg:hidden"
    >
      <ul className="flex items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium',
                  focusRing,
                  active ? 'text-brand' : 'text-muted',
                )}
              >
                <Icon size={22} aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
