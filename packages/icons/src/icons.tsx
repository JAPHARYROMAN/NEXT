import { Icon, type IconProps } from './icon';

type NamedIconProps = Omit<IconProps, 'children'>;

export function IconHome(props: NamedIconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </Icon>
  );
}

export function IconExplore(props: NamedIconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.5 9 15l5.5-5.5M9.5 9.5 15 15" />
    </Icon>
  );
}

export function IconPlay(props: NamedIconProps) {
  return (
    <Icon {...props}>
      <path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconBell(props: NamedIconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a5 5 0 0 0-5 5v3.5L5 14v1h14v-1l-2-2.5V8a5 5 0 0 0-5-5z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function IconLibrary(props: NamedIconProps) {
  return (
    <Icon {...props}>
      <path d="M5 4h4v16H5zM15 4h4v10h-4zM10 8h4v12h-4z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconSearch(props: NamedIconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </Icon>
  );
}

export function IconStudio(props: NamedIconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="5" width="16" height="12" rx="2" />
      <path d="M10 9.5v5l5-2.5-5-2.5z" fill="currentColor" stroke="none" />
    </Icon>
  );
}
