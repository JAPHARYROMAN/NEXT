'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import type { QuestionItem } from './types';

export interface QuestionQueueProps {
  readonly questions: readonly QuestionItem[];
  readonly className?: string;
}

export function QuestionQueue({ questions, className }: QuestionQueueProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Question queue">
      <h3 className="text-sm font-medium">Questions for creator</h3>
      <ol className="mt-3 space-y-2 text-sm">
        {questions.map((q, i) => (
          <li key={q.id} className="flex gap-2 rounded-lg bg-surface/40 px-3 py-2">
            <span className="text-xs text-muted tabular-nums">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate">{q.body}</p>
              <p className="text-xs text-muted">
                {q.author} · {q.votes} votes
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Surface>
  );
}
