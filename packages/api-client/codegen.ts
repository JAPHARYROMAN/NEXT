import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema:
    process.env['NEXT_GRAPHQL_SCHEMA_URL'] ?? '../../services/api-gateway/schema/schema.graphqls',
  documents: [],
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
};

export default config;
