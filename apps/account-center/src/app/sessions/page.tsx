// Active sessions view. The gateway's mySessions query (JWT-gated) lands in
// Phase 7 once the portal issues a real token; until then this page explains
// the upcoming surface and links back to the portal.

export default function SessionsPage() {
  return (
    <section>
      <h1 className="font-display text-h2">Sessions</h1>
      <p className="mt-2 text-muted text-small max-w-prose">
        Every device you are signed in on appears here, with the option to revoke any one of them.
        This view is gated on a verified session token.
      </p>

      <div className="mt-8 rounded-lg border border-subtle/20 bg-surface p-6">
        <p className="text-small text-muted">
          Sign in through the auth portal to load your active sessions. The session list is served
          by <code className="font-mono text-fg">session-service</code> via the gateway&apos;s{' '}
          <code className="font-mono text-fg">mySessions</code> query.
        </p>
      </div>
    </section>
  );
}
