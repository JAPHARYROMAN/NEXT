import { Redis, Cluster, type RedisOptions, type ClusterOptions } from 'ioredis';

export interface RedisConfig {
  readonly url: string;
  readonly cluster?: boolean;
  readonly tls?: boolean;
  readonly keyPrefix?: string;
}

export function createRedis(config: RedisConfig): Redis | Cluster {
  const opts: RedisOptions = {
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    keyPrefix: config.keyPrefix,
    ...(config.tls ? { tls: {} } : {}),
  };
  if (config.cluster) {
    const clusterOpts: ClusterOptions = { redisOptions: opts };
    return new Cluster([config.url], clusterOpts);
  }
  return new Redis(config.url, opts);
}
