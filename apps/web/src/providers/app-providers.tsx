'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ThemeProvider } from '@next/ui';
import { createQueryClient } from '@next/frontend-utils';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initial="system">{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
