'use client';

import { Surface } from '@next/ui';

export function RefundPolicyShell() {
  return (
    <Surface bordered className="p-5" aria-label="Refund policy">
      <h3 className="text-sm font-medium text-fg">Refund policy</h3>
      <p className="mt-2 text-sm text-muted">
        Digital purchases may be refunded within 7 days if access was not substantially used.
        Subscriptions refund the unused portion of the current period.
      </p>
    </Surface>
  );
}

export function ReportCommerceAbuseShell({ onReport }: { onReport?: () => void }) {
  return (
    <Surface bordered className="p-5" aria-label="Report commerce issue">
      <h3 className="text-sm font-medium text-fg">Report a commerce issue</h3>
      <p className="mt-2 text-sm text-muted">
        Suspicious offers, misleading pricing, or undisclosed sponsorships can be reported here.
      </p>
      <button type="button" onClick={onReport} className="mt-3 text-sm text-accent hover:underline">
        Start report
      </button>
    </Surface>
  );
}

export function FinancialSafetyNotice() {
  return (
    <Surface bordered className="border-sky-500/20 bg-sky-500/5 p-4" role="note">
      <p className="text-sm text-fg">
        NEXT never asks for payment credentials in chat or DMs. Manage billing only through official
        account settings.
      </p>
    </Surface>
  );
}
