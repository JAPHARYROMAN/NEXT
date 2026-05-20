'use client';

export interface BioEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly maxLength?: number;
}

export function BioEditor({ value, onChange, maxLength = 280 }: BioEditorProps) {
  return (
    <label className="block text-sm">
      <span className="text-muted">Bio</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        rows={4}
        className="mt-1 w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-sm"
        aria-describedby="bio-count"
      />
      <span id="bio-count" className="mt-1 block text-xs text-muted">
        {value.length}/{maxLength}
      </span>
    </label>
  );
}
