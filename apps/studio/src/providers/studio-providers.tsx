'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@next/frontend-utils';
import type { ReactNode } from 'react';
import { useState } from 'react';

export function StudioProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => createQueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
