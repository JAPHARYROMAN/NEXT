'use client';

import { Surface, Button } from '@next/ui';
import { useCreatorStore } from '@next/frontend-utils';

export default function UploadPage() {
  const step = useCreatorStore((s) => s.step);
  const setStep = useCreatorStore((s) => s.setStep);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Upload</h1>
      <Surface bordered className="p-6">
        <p className="text-sm text-muted">Step: {step}</p>
        <p className="mt-2 text-sm">
          TUS resumable upload wires to media-ingest when API is ready.
        </p>
        <Button className="mt-6" onClick={() => setStep('details')}>
          Continue to details
        </Button>
      </Surface>
    </div>
  );
}
