# Tax & Compliance Architecture

> The system architecture for collecting tax, issuing invoices and receipts,
> handling creator tax forms, and producing financial reports.

> **Scope note.** This document is **system architecture only**. It is not legal
> or tax advice. Actual tax rates, rules, thresholds, and obligations are
> jurisdiction-specific and are supplied by tax authorities and qualified
> advisors — the architecture _consumes_ those rules; it does not invent them.

## 0. Principle

Tax and compliance are treated as a **pluggable rules layer over the ledger**,
not as logic scattered through the economy. A jurisdiction's rules change often;
the architecture isolates that change behind a rules engine so the rest of the
economy is unaffected. Owned by the proposed `tax-compliance-service` (Go).

## 1. The shape

```
 a taxable transaction
        │
        ▼
 tax-compliance-service
   ├── jurisdiction resolution   (who is taxed, by whom, where)
   ├── tax rules engine          (rates + rules — supplied externally, versioned)
   ├── tax calculation           (amount, recorded as a ledger entry)
   ├── document generation       (invoices, receipts)
   └── creator tax records       (forms, thresholds, year-end reporting)
```

The **tax rules engine** is the pluggable core: rules are _data_, supplied per
jurisdiction, **versioned** (a transaction is taxed under the rule version in
force at its time — like an ADR or a policy version). NEXT does not hard-code
tax law.

## 2. Tax collection

- On a taxable transaction, `tax-compliance-service` resolves the jurisdiction(s),
  applies the in-force rule version, and computes the tax amount.
- The tax amount is recorded in the ledger as a credit to the `tax_collected`
  account ([ledger-architecture.md](ledger-architecture.md) §1) — tax is held
  _on behalf of_ the authority, distinct from platform fee and creator revenue.
- The transaction's debits and credits still balance: `user_funds` debited;
  `tax_collected`, `processing_fee`, `platform_fee`, `creator_revenue` credited.
- Tax-inclusive vs. tax-added pricing is a presentation rule resolved before
  charge, so the user sees the true total before they commit (no hidden fees,
  [creator-monetization.md](creator-monetization.md) §3).

## 3. Invoices & receipts

- Every transaction produces a **receipt** for the payer — itemized: net,
  tax, total, the parties.
- Where a jurisdiction requires a formal **invoice**, one is generated to that
  jurisdiction's format from the same transaction record.
- Receipts and invoices are **derived from the ledger** — they are renderings of
  an immutable transaction, never a separate editable record. A reissued
  document renders the same underlying transaction.

## 4. Creator tax records

- A creator has a **tax profile** — jurisdiction, tax identifiers, and the tax
  **forms** their jurisdiction requires.
- A missing required form places a **payout hold** ([payouts.md](payouts.md) §5)
  — disclosed, with exactly what is needed to clear it.
- The service tracks **reporting thresholds** — when a creator's earnings cross
  a jurisdiction's reporting threshold, the appropriate year-end records are
  prepared.
- Creator tax data is **sensitive** — encrypted, least-privilege, redacted in
  logs.

## 5. Financial reporting

- **Per-creator** — year-end earnings summaries and the records a creator needs
  for their own filing.
- **Platform** — aggregate financial reports, tax-collected-by-jurisdiction
  reports, all derived from the ledger and reconcilable against it.
- Reporting reads from the ledger and from ClickHouse analytics
  ([economy-events.md](economy-events.md)); it never holds its own separate
  truth.

## 6. Compliance posture

- **Payout compliance** — sanctions/eligibility screening of payout
  destinations, integrated with the payout flow; a failed screen is a disclosed
  payout hold.
- **Record retention** — financial records (ledger, invoices, tax records) are
  retained per the platform's compliance-retention policy; financial records are
  **never** subject to trust decay or deletion ([docs/trust-safety/appeals-system.md](../trust-safety/appeals-system.md)
  §5 establishes the same principle for audit records).
- **Auditability** — every tax calculation references its rule version and its
  ledger transaction; "why was this amount of tax charged" is always answerable.

## 7. Why a rules engine, not hard-coded law

Tax law is the fastest-changing input to the economy and the most
jurisdiction-fragmented. Hard-coding it would mean a code change for every rate
change in every market — and would scatter compliance risk across the codebase.
A versioned, data-driven rules engine means: a rule change is a data update;
historical transactions stay interpretable under their original rule version;
and entering a new market is adding a rule set, not re-engineering the economy.

## 8. Events & observability

Events: `commerce.tax.calculated.v1`, `commerce.invoice.generated.v1`,
`commerce.tax_form.required.v1` / `.completed.v1` — stream `commerce.events.v1`
([economy-events.md](economy-events.md)).

Observability: tax-calculation success rate, rule-version coverage per active
jurisdiction, tax-form completion rate, payout holds attributable to tax,
reporting-pipeline freshness.

## Related documents

- [ledger-architecture.md](ledger-architecture.md) · [payouts.md](payouts.md) · [economy-events.md](economy-events.md) · [platform-economy-architecture.md](platform-economy-architecture.md)
