// NEXT — syncpack: keep dependency versions aligned across the JS/TS workspaces.
// Versions are pinned in pnpm-workspace.yaml `catalog:` and consumed via `catalog:<name>`.

module.exports = {
  customTypes: {
    enginesNode: { path: 'engines.node', strategy: 'version' },
    enginesPnpm: { path: 'engines.pnpm', strategy: 'version' },
    packageManager: { path: 'packageManager', strategy: 'name@version' },
  },
  dependencyTypes: ['prod', 'dev', 'peer', 'optional', 'enginesNode', 'enginesPnpm', 'packageManager'],
  semverGroups: [
    {
      label: 'Pin TypeScript exactly',
      packages: ['**'],
      dependencies: ['typescript'],
      range: '',
    },
    {
      label: 'Caret everywhere else',
      packages: ['**'],
      dependencies: ['**'],
      range: '^',
    },
  ],
  versionGroups: [
    {
      label: 'Internal workspace packages always use workspace protocol',
      packages: ['**'],
      dependencies: ['@next/**'],
      pinVersion: 'workspace:*',
    },
    {
      label: 'React 19 family aligned',
      packages: ['**'],
      dependencies: ['react', 'react-dom'],
      policy: 'sameRange',
    },
    {
      label: 'OpenTelemetry packages aligned',
      packages: ['**'],
      dependencies: ['@opentelemetry/**'],
      policy: 'sameRange',
    },
  ],
};
