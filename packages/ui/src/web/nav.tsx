'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ComponentType } from 'react';
import { focusRing } from '@next/design-system';
import type { IconProps } from '@next/icons';

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: ComponentType<IconProps>;
}

export interface AppNavProps {
  readonly items: readonly NavItem[];
  readonly className?: string;
}

export function AppNav({ items, className }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={clsx('flex flex-col gap-1 p-3', className)}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-quick',
              focusRing,
              active ? 'bg-elevated text-fg' : 'text-muted hover:bg-elevated/60 hover:text-fg',
            )}
          >
            <Icon size={20} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
