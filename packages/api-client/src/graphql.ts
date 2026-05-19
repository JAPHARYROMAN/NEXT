import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import type { NormalizedCacheObject } from '@apollo/client';

export interface GraphqlClientConfig {
  readonly uri: string;
  readonly getAuthToken?: () => string | null;
  readonly fetch?: typeof globalThis.fetch;
}

export function createGraphqlClient(config: GraphqlClientConfig): ApolloClient<NormalizedCacheObject> {
  const http = new HttpLink({
    uri: config.uri,
    fetch: config.fetch,
    credentials: 'include',
    fetchOptions: { keepalive: true },
  });

  const auth = {
    request: (operation: { setContext: (fn: (prev: { headers?: Record<string, string> }) => unknown) => void }) => {
      const token = config.getAuthToken?.();
      if (token) {
        operation.setContext((prev) => ({
          headers: { ...prev.headers, authorization: `Bearer ${token}` },
        }));
      }
    },
  };

  return new ApolloClient({
    link: from([
      { request: auth.request } as unknown as Parameters<typeof from>[0][number],
      http,
    ]),
    cache: new InMemoryCache(),
    queryDeduplication: true,
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
      query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    },
  });
}
