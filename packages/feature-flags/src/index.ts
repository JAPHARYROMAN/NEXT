import { OpenFeature, type Client, type EvaluationContext } from '@openfeature/server-sdk';
export { FLAGS, type FlagKey } from '../flags';

export interface FlagsConfig {
  readonly apiHost: string;
  readonly clientKey: string;
  readonly cacheTtlSec?: number;
}

let client: Client | undefined;

export async function initFlags(_config: FlagsConfig): Promise<Client> {
  if (client) return client;
  // GrowthBook provider wiring happens at app boot — keep this thin so the
  // package stays tree-shakeable and the provider can be swapped (per ADR 0013).
  client = OpenFeature.getClient('next');
  return client;
}

export async function evaluate<T extends string | boolean | number>(
  flag: string,
  defaultValue: T,
  context: EvaluationContext = {},
): Promise<T> {
  if (!client) throw new Error('initFlags() not called');
  if (typeof defaultValue === 'boolean') {
    return (await client.getBooleanValue(flag, defaultValue, context)) as T;
  }
  if (typeof defaultValue === 'number') {
    return (await client.getNumberValue(flag, defaultValue, context)) as T;
  }
  return (await client.getStringValue(flag, defaultValue as string, context)) as T;
}
