import { IconExplore, IconHome, IconLibrary, IconPlay, IconSearch } from '@next/icons';
import type { AdaptiveNavItem } from '@next/navigation-ui';

export const mobileNavItems: readonly AdaptiveNavItem[] = [
  { href: '/mobile', label: 'Home', icon: IconHome },
  { href: '/mobile/feed', label: 'Feed', icon: IconPlay },
  { href: '/mobile/explore', label: 'Explore', icon: IconExplore },
  { href: '/mobile/library', label: 'Library', icon: IconLibrary },
  { href: '/mobile/search', label: 'Search', icon: IconSearch },
];
