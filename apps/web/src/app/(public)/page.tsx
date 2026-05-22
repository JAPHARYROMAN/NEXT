import Link from 'next/link';
import { Button } from '@next/ui';

export default function LandingPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-brand">
        Human-centered media
      </p>
      <h1 className="mt-4 font-display text-display tracking-tight">Discover what moves you.</h1>
      <p className="mt-6 max-w-prose text-lg text-muted">
        NEXT is a calm, cinematic ecosystem for creators and culture — precision, expansion, and
        intentional chaos without engagement manipulation.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/welcome">
          <Button size="lg">Begin</Button>
        </Link>
        <Link href="/discovery">
          <Button size="lg" variant="secondary">
            Explore publicly
          </Button>
        </Link>
      </div>
    </section>
  );
}
