export const runtime = 'edge';
export const revalidate = 60;

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="font-display text-display tracking-tight">NEXT</h1>
      <p className="mt-6 text-muted text-body max-w-prose">
        A planetary-scale, human-centered, AI-native media ecosystem.
      </p>
    </main>
  );
}
