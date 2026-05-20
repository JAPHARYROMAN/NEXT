import { Surface, Button } from '@next/ui';

export default function LiveControlPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Live control room</h1>
      <Surface bordered className="aspect-video p-6">
        <p className="text-sm text-muted">Stream health, chat moderation, and scene switches.</p>
        <Button className="mt-6" variant="danger">
          Go live (placeholder)
        </Button>
      </Surface>
    </div>
  );
}
