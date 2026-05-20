import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../../services/api-gateway/schema/schema.graphqls',
  documents: [
    '../../apps/**/*.{ts,tsx,graphql,gql}',
    '../../packages/**/*.{ts,tsx,graphql,gql}',
    '!../../**/node_modules/**',
    '!../../**/.next/**',
    '!../../**/dist/**',
    '!../../**/build/**',
    '!../../**/.turbo/**',
    '!../../**/coverage/**',
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
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
