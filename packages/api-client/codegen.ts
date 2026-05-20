import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env['NEXT_GRAPHQL_SCHEMA_URL'] ?? ['./src/__generated__/schema.graphql'],
  documents: ['../../apps/**/*.{ts,tsx}', '../../packages/**/*.{ts,tsx}'],
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
