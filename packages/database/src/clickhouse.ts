import { createClient, type ClickHouseClient } from '@clickhouse/client';

export interface ClickHouseConfig {
  readonly url: string;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly applicationName: string;
}

export function createClickHouse(config: ClickHouseConfig): ClickHouseClient {
  return createClient({
    url: config.url,
    database: config.database,
    username: config.username,
    password: config.password,
    application: config.applicationName,
    clickhouse_settings: { async_insert: 1, wait_for_async_insert: 0 },
    compression: { request: true, response: true },
  });
}
