import postgres, { type Sql } from 'postgres';

export interface PostgresConfig {
  readonly url: string;
  readonly maxConnections?: number;
  readonly idleTimeoutSec?: number;
  readonly connectTimeoutSec?: number;
  readonly applicationName: string;
}

export function createPostgres(config: PostgresConfig): Sql {
  return postgres(config.url, {
    max: config.maxConnections ?? 20,
    idle_timeout: config.idleTimeoutSec ?? 30,
    connect_timeout: config.connectTimeoutSec ?? 10,
    connection: { application_name: config.applicationName },
    prepare: true,
    onnotice: () => undefined,
  });
}
