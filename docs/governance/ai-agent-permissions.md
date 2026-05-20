# AI-Agent Permission Model

> The precise boundaries of what each AI agent may do on its own, what needs
> approval, and what no agent may ever do autonomously. This is the safety
> model for a codebase built largely by AI.

## 0. Principle

AI agents are fast, capable, and **sometimes confidently wrong**. The permission
model is built on that last fact. It is not about distrust — it is about
**containing the blast radius of an error** so that agent speed is safe to use.
Every permission below is calibrated to: _if the agent is wrong here, how bad is
it, and how fast is it caught?_

## 1. The four permission levels

| Level          | Meaning                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| **AUTONOMOUS** | the agent may do this within its domain without prior approval; caught by review    |
| **REVIEW**     | the agent may do this, but it requires the standard PR review + gates before merge  |
| **GOVERNED**   | requires Claude architecture governance (an ADR or explicit architectural sign-off) |
| **HUMAN**      | requires explicit human-maintainer approval; never agent-autonomous                 |
| **NEVER**      | no agent may do this autonomously under any circumstances                           |

## 2. The permission matrix

| Action                                                      | Claude         | Codex          | Composer       | Copilot                             |
| ----------------------------------------------------------- | -------------- | -------------- | -------------- | ----------------------------------- |
| Edit files **in own domain**                                | AUTONOMOUS     | AUTONOMOUS     | AUTONOMOUS     | only within a file an owner directs |
| Edit files **outside own domain**                           | REVIEW¹        | NEVER²         | NEVER²         | NEVER                               |
| Create a new service (existing patterns)                    | —              | REVIEW         | —              | NEVER                               |
| Create a new app / frontend surface                         | —              | —              | REVIEW         | NEVER                               |
| Author / change an ADR                                      | AUTONOMOUS³    | GOVERNED       | GOVERNED       | NEVER                               |
| Introduce a new runtime / language                          | HUMAN          | HUMAN          | HUMAN          | NEVER                               |
| Introduce a new datastore / messaging system                | GOVERNED+HUMAN | GOVERNED       | GOVERNED       | NEVER                               |
| Change an event contract / proto schema                     | GOVERNED       | GOVERNED       | GOVERNED       | NEVER                               |
| Change a database schema (migration)                        | —              | REVIEW         | —              | NEVER                               |
| Change a security / auth boundary                           | GOVERNED+HUMAN | GOVERNED+HUMAN | GOVERNED+HUMAN | NEVER                               |
| Modify CI / deployment pipelines                            | REVIEW⁴        | REVIEW         | NEVER          | NEVER                               |
| Commit to `develop` / `main` directly                       | NEVER          | NEVER          | NEVER          | NEVER                               |
| Merge a PR                                                  | HUMAN          | HUMAN          | HUMAN          | NEVER                               |
| Deploy to production                                        | HUMAN          | HUMAN          | HUMAN          | NEVER                               |
| Run a destructive op (delete branch, force-push, drop data) | HUMAN          | HUMAN          | HUMAN          | NEVER                               |
| Act as authoritative decision-maker in an incident          | NEVER⁵         | NEVER⁵         | NEVER⁵         | NEVER                               |

¹ Claude reviews and audits across domains but does **not implement** backend or
frontend code; cross-domain edits Claude makes are coherence/doc changes,
reviewed.
² Only with a recorded cross-domain assignment ([multi-agent-governance.md](multi-agent-governance.md) §4).
³ Claude owns the ADR system; ADRs are still opened as PRs and reviewed.
⁴ CI is Codex's domain; Claude may propose governance-related CI changes via
assignment.
⁵ Agents _assist_ in incidents; humans hold authority — see [incident-governance.md](incident-governance.md).

## 3. What no agent may ever do autonomously

The **NEVER** list — independent of domain, level, or assignment:

- Commit directly to `main` or `develop`.
- Merge a pull request.
- Deploy to production, or change what is live.
- Run a destructive or irreversible operation (force-push, branch deletion,
  history rewrite, data drop, secret rotation) without explicit human approval.
- Introduce a new runtime, datastore, or messaging system without an ADR + human
  sign-off.
- Change a security or authentication boundary without governance + human
  sign-off.
- Disable, weaken, or bypass a safety/quality gate (CI checks, review,
  CODEOWNERS, branch protection).
- Act as the final authority in a production incident.
- Modify another agent's domain without a recorded assignment.
- Commit secrets, or weaken secret handling.

If a task appears to require one of these, the agent **escalates** — it does not
proceed. Escalation is the correct action; proceeding is the failure.

## 4. Hallucination containment

The model assumes an agent may be wrong and contains it structurally:

- **Bounded domains** — an error is capped at one domain ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)).
- **Branch isolation** — an error stays off `main` until human-gated review.
- **Review designed for fallible authors** — gates and CODEOWNERS assume the
  author (human or AI) may be mistaken ([code-review-doctrine.md](code-review-doctrine.md)).
- **ADRs over recollection** — an agent consults the ADR/source, never its own
  memory, for an architectural fact. "I recall that X exists" is not evidence;
  grepping for X is.
- **Verify before recommending** — a claim that a file, function, or flag exists
  is checked against the repo before it is acted on.
- **Escalate over invent** — uncertainty routes to a human; a confident
  fabrication is the thing the model exists to prevent.

## 5. Architecture protection rules

Specific guards for the highest-value, hardest-to-reverse surfaces:

- **The Constitution and accepted ADRs are read-only to autonomous action** — an
  agent may _propose_ a superseding ADR; it may not act against an accepted one.
- **Runtime boundaries are inviolable** without the [exception process](runtime-governance.md).
- **Shared-interface packages** change interface-first, with announcement
  ([multi-agent-governance.md](multi-agent-governance.md) §5).
- **Safety gates may not be self-disabled** — an agent blocked by a gate fixes
  the underlying issue or escalates; it never removes the gate.
- **The technical-debt register is append-honest** — an agent that creates debt
  records it; it does not quietly leave it.

## 6. Copilot-specific scope

Copilot is the most constrained agent on purpose: it has **no system ownership**
and **no autonomous authority**. It accelerates _local, file-level_ work that an
owning agent or a human is already directing — completing a function, drafting a
test for specified behavior, filling boilerplate. It never scaffolds a service,
makes an architectural choice, or acts across files on its own initiative. Its
binding directives live in
[.github/instructions](../../.github/instructions/copilot-execution-directive.instructions.md).

## 7. Human authority is final

At the top of every escalation path is the **human maintainer**. The permission
model exists so that agents can move fast on the vast majority of work that is
safe — and so that the rare, dangerous, or irreversible decisions reliably reach
a human. Speed for the reversible; humans for the irreversible. That is the
whole model.

## Related documents

- [multi-agent-governance.md](multi-agent-governance.md) · [architecture-governance.md](architecture-governance.md) · [runtime-governance.md](runtime-governance.md) · [code-review-doctrine.md](code-review-doctrine.md) · [incident-governance.md](incident-governance.md)
- [.github/instructions](../../.github/instructions/)
