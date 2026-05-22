'use client';

import type { ComponentType } from 'react';
import { AdaptiveBottomNav } from '@next/navigation-ui';
import type { IconProps } from '@next/icons';

export interface MobileNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: ComponentType<IconProps>;
}

export interface MobileNavProps {
  readonly items: readonly MobileNavItem[];
}

/** Legacy export — delegates to adaptive bottom navigation. */
export function MobileNav({ items }: MobileNavProps) {
  return <AdaptiveBottomNav items={items} maxVisible={5} />;
}
