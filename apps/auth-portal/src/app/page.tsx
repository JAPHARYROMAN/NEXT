import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="font-display text-h2 tracking-tight">NEXT</h1>
      <p className="mt-3 text-muted text-small">The identity portal.</p>
      <div className="mt-8 grid gap-3">
        <Link
          href="/sign-in"
          className="bg-brand text-white rounded-md px-4 py-2.5 transition duration-quick"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="bg-elevated text-fg border border-subtle/30 rounded-md px-4 py-2.5 transition duration-quick"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
