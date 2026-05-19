// gRPC client factories. Generated stubs live under src/__generated__/grpc/.
// This file exposes the small amount of cross-cutting code (interceptors, metadata
// propagation, deadlines) that wraps the generated clients.

export interface GrpcClientConfig {
  readonly endpoint: string;
  readonly defaultDeadlineMs?: number;
  readonly getAuthToken?: () => string | null;
}

export const DEFAULT_DEADLINE_MS = 5_000;
