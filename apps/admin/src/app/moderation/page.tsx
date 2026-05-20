import { Surface, Button } from '@next/ui';

export default function ModerationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Moderation queue</h1>
      <Surface bordered className="p-6">
        <p className="text-sm text-muted">
          Review surfaces — connect to moderation service when contracts land.
        </p>
        <Button className="mt-4" variant="secondary">
          Pull next item (placeholder)
        </Button>
      </Surface>
    </div>
  );
}
