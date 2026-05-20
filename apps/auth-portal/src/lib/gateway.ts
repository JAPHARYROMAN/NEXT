// GraphQL client for the auth-portal. Talks to the api-gateway.

const GATEWAY_URL = process.env['NEXT_PUBLIC_GRAPHQL_URL'] ?? 'http://localhost:14000/graphql';

export interface GraphQLResult<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<GraphQLResult<T>> {
  const resp = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return resp.json() as Promise<GraphQLResult<T>>;
}
