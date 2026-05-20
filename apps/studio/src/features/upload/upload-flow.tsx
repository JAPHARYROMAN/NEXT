'use client';

import { PublishingShell, UploadProgress, UploadZone } from '@next/studio-components';
import { PageTransition } from '@next/animation-system';
import { Button } from '@next/ui';
import { useCreatorStore, useUploadStore, trackUploadFlow } from '@next/frontend-utils';
import { useCallback, useEffect } from 'react';

export function UploadFlow() {
  const step = useCreatorStore((s) => s.step);
  const setStep = useCreatorStore((s) => s.setStep);
  const phase = useUploadStore((s) => s.phase);
  const files = useUploadStore((s) => s.files);
  const setPhase = useUploadStore((s) => s.setPhase);
  const addFile = useUploadStore((s) => s.addFile);
  const updateProgress = useUploadStore((s) => s.updateProgress);

  const simulateUpload = useCallback(
    (name: string) => {
      addFile({ name, percent: 0, chunked: true });
      setPhase('uploading');
      trackUploadFlow('upload_start', { file: name });
      let p = 0;
      const id = setInterval(() => {
        p += 12;
        updateProgress(name, Math.min(p, 100));
        if (p >= 100) {
          clearInterval(id);
          setPhase('metadata');
          setStep('details');
          trackUploadFlow('upload_complete', { file: name });
        }
      }, 280);
    },
    [addFile, setPhase, setStep, updateProgress],
  );

  const onFiles = useCallback(
    (list: FileList) => {
      Array.from(list).forEach((f) => simulateUpload(f.name));
    },
    [simulateUpload],
  );

  useEffect(() => {
    trackUploadFlow('view', { step });
  }, [step]);

  return (
    <PageTransition routeKey={step} className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold">Upload</h1>
      {step === 'upload' && phase !== 'metadata' ? (
        <>
          <UploadZone onFiles={onFiles} />
          {files.map((f) => (
            <UploadProgress
              key={f.name}
              fileName={f.name}
              percent={f.percent}
              chunked={f.chunked}
            />
          ))}
        </>
      ) : null}
      {(step === 'details' || phase === 'metadata') && (
        <>
          <PublishingShell />
          <div className="rounded-xl border border-subtle/15 bg-surface p-4 text-sm text-muted">
            Media validation UI — codec, duration, rights checks (placeholder).
          </div>
          <Button onClick={() => setStep('publish')}>Continue to publish</Button>
        </>
      )}
      {step === 'publish' && (
        <div className="space-y-4">
          <p className="text-sm text-muted">Ready to publish — API integration pending.</p>
          <Button>Publish to NEXT</Button>
        </div>
      )}
    </PageTransition>
  );
}
