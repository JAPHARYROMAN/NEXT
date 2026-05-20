'use client';

export interface HandleFieldProps {
  readonly value: string;
  readonly available: boolean | null;
  readonly onChange: (value: string) => void;
  readonly onCheck: () => void;
  readonly error?: string | undefined;
}

export function HandleField({ value, available, onChange, onCheck, error }: HandleFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="text-muted">Handle</span>
        <div className="mt-1 flex gap-2">
          <span className="flex items-center rounded-l-lg border border-r-0 border-subtle/20 bg-elevated/30 px-2 text-muted">
            @
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            onBlur={onCheck}
            className="w-full rounded-r-lg border border-subtle/20 bg-bg px-3 py-2 text-sm"
            aria-invalid={Boolean(error) || available === false}
            aria-describedby="handle-hint"
            autoComplete="username"
          />
        </div>
      </label>
      <p id="handle-hint" className="text-xs text-muted">
        {available === true && <span className="text-accent">Available (demo check)</span>}
        {available === false && <span className="text-red-400">Unavailable or invalid</span>}
        {available === null && 'Letters, numbers, underscores — checked on blur.'}
      </p>
      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
