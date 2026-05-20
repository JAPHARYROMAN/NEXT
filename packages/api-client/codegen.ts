import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema:
    process.env['NEXT_GRAPHQL_SCHEMA_URL'] ?? '../../services/api-gateway/schema/schema.graphqls',
  documents: [
    '../../apps/**/*.{ts,tsx,graphql,gql}',
    '../../packages/**/*.{ts,tsx,graphql,gql}',
    '!../../packages/api-client/src/__generated__/**',
    '!../../packages/events/src/__generated__/**',
    '!../../**/node_modules/**',
    '!../../**/.next/**',
    '!../../**/dist/**',
    '!../../**/build/**',
    '!../../**/.turbo/**',
    '!../../**/coverage/**',
    // recommendation-sdk documents ahead of api-gateway schema; re-include when gateway exposes them
    '!../../packages/recommendation-sdk/**',
  ],
  ignoreNoDocuments: true,
  generates: {
    'src/__generated__/': {
      preset: 'client',
      presetConfig: { fragmentMasking: { unmaskFunctionName: 'unmask' } },
      config: {
        useTypeImports: true,
        scalars: { DateTime: 'string', JSON: 'unknown', URL: 'string' },
      },
    },
    'src/__generated__/schema.graphql': { plugins: ['schema-ast'] },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
