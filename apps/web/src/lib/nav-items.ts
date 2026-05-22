import { IconBell, IconExplore, IconHome, IconLibrary, IconPlay, IconSearch } from '@next/icons';
import type { NavItem } from '@next/ui';

export const primaryNavItems: readonly NavItem[] = [
  { href: '/home', label: 'Home', icon: IconHome },
  { href: '/feed', label: 'Feed', icon: IconPlay },
  { href: '/explore', label: 'Explore', icon: IconExplore },
  { href: '/search', label: 'Search', icon: IconSearch },
  { href: '/communities', label: 'Communities', icon: IconExplore },
  { href: '/live', label: 'Live', icon: IconPlay },
  { href: '/events', label: 'Events', icon: IconPlay },
  { href: '/library', label: 'Library', icon: IconLibrary },
  { href: '/notifications', label: 'Notifications', icon: IconBell },
];

export const discoveryNavItems: readonly NavItem[] = [
  { href: '/discover', label: 'Discover', icon: IconExplore },
  { href: '/trending', label: 'Trending', icon: IconExplore },
  { href: '/creators', label: 'Creators', icon: IconExplore },
  { href: '/chaos', label: 'Chaos', icon: IconExplore },
];
