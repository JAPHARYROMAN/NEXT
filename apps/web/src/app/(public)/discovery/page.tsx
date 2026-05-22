import { FeedGrid } from '@/features/feed/feed-grid';

export const metadata = { title: 'Discovery' };

export default function DiscoveryPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold">Public discovery</h1>
      <p className="mt-2 text-muted">Serendipity-forward previews — no login required.</p>
      <div className="mt-10">
        <FeedGrid title="Emerging now" />
      </div>
    </section>
  );
}
