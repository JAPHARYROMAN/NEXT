# Payout Experience

Studio `/payouts` — payout schedule, status, ledger, statement download shell.

## States

| Status    | UX                             |
| --------- | ------------------------------ |
| available | Ready to transfer              |
| pending   | Processing, no alarm           |
| scheduled | Next date shown                |
| failed    | Reason + update method         |
| hold      | Review context, not fear-heavy |

## Components

- `PayoutStatusPanel`
- `PayoutSchedule`
- `RevenueLedgerPreview`

## Telemetry

`trackPayoutInteraction` for statement download and method updates.
