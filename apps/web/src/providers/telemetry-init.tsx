'use client';

import { useEffect } from 'react';
import { initAppTelemetry } from '@/lib/telemetry';

export function TelemetryInit() {
  useEffect(() => {
    initAppTelemetry();
  }, []);
  return null;
}
