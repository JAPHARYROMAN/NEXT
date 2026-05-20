import { IconBell, IconExplore, IconHome, IconLibrary } from '@next/icons';
import type { NavItem } from '@next/ui';

export const primaryNavItems: readonly NavItem[] = [
  { href: '/home', label: 'Home', icon: IconHome },
  { href: '/explore', label: 'Explore', icon: IconExplore },
  { href: '/library', label: 'Library', icon: IconLibrary },
  { href: '/notifications', label: 'Notifications', icon: IconBell },
];
