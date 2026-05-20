import type { CodegenConfig } from '@graphql-codegen/cli';
import { createRequire } from 'node:module';

const localRequire = createRequire(import.meta.url);
const clientPresetRequire = createRequire(
  localRequire.resolve('@graphql-codegen/client-preset/package.json'),
);
const cliRequire = createRequire(localRequire.resolve('@graphql-codegen/cli/package.json'));

const loadCodegenPlugin = async (name: string): Promise<unknown> => {
  if (
    name === '@graphql-codegen/add' ||
    name === '@graphql-codegen/typescript' ||
    name === '@graphql-codegen/typescript-operations' ||
    name === '@graphql-codegen/typed-document-node'
  ) {
    return clientPresetRequire(name);
  }

  if (name === '@graphql-codegen/schema-ast') {
    return cliRequire(name);
  }

  return localRequire(name);
};

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
  ],
  ignoreNoDocuments: true,
  pluginLoader: loadCodegenPlugin,
  generates: {
    'src/__generated__/graphql.ts': {
      plugins: [
        { add: { content: '/* eslint-disable */\n// @ts-nocheck' } },
        'typescript',
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        skipDocumentsValidation: true,
        useTypeImports: true,
        scalars: { DateTime: 'string', JSON: 'unknown', URL: 'string' },
      },
    },
    'src/__generated__/schema.graphql': {
      plugins: ['schema-ast'],
      config: { skipDocumentsValidation: true },
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
