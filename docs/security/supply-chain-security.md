# Supply-Chain Security

> Trusting what NEXT ships. A platform is not only the code its team writes — it
> is every dependency, every base image, every build step. Supply-chain security
> makes the path from source to running production verifiable end to end.

## 0. Principle

The supply-chain attack does not break in the front door — it gets _invited in_,
inside a dependency, a base image, or a build tool. NEXT's defense is a
**verifiable trust chain**: every artifact that runs in production can be traced
to reviewed source through signed, attested steps. Nothing unverified runs.

## 1. The trust chain

```
 source (reviewed) ──▶ dependencies (verified) ──▶ build (CI, attested)
        │                                                │
        ▼                                                ▼
   commit-signed,                              artifact: signed + SBOM
   branch-protected                                      │
                                                          ▼
                              deploy: signature + provenance verified ──▶ production
```

Every arrow is a checkpoint. A break in the chain — an unverified dependency, an
unsigned artifact, an unattested build — stops the deploy.

## 2. Dependency verification

- A new third-party dependency is **reviewed** — for security history, licence,
  maintenance health, and whether it duplicates something already in the tree
  ([docs/standards/monorepo-governance.md](../standards/monorepo-governance.md) §6).
- Dependencies are **pinned** (lockfiles, workspace catalogs) — a build resolves
  the exact, reviewed versions, not "latest".
- **Vulnerability scanning** runs in CI on every PR and continuously on the
  dependency set; a known-vulnerable dependency is a merge blocker / an alert
  ([docs/standards/enforcement-mechanisms.md](../standards/enforcement-mechanisms.md)).
- Dependency _integrity_ is checked — lockfile hashes are verified; a registry
  artifact whose hash changed is rejected (defends against a republished
  malicious version).

## 3. SBOM generation

- Every built artifact has a **Software Bill of Materials** — a complete,
  machine-readable inventory of what is in it.
- The SBOM is generated in CI and stored with the artifact.
- When a new CVE lands, the SBOMs answer **"are we affected, and where"**
  immediately — without it, that question takes a frightened week.

## 4. Image & artifact signing

- Every container image and deployable artifact is **cryptographically signed**
  in CI (a Sigstore/cosign-class mechanism).
- Signing keys are held in Vault / a managed KMS; signing happens in the trusted
  CI environment, not on a developer or agent machine.
- **Deployment verifies the signature** — the cluster's admission control
  rejects an unsigned or wrongly-signed image ([infrastructure-hardening.md](infrastructure-hardening.md) §3).
  An unsigned artifact **cannot run in production**.

## 5. CI/CD verification & provenance

- Builds run **only in trusted CI** — reproducible, isolated, with no
  unreviewed step. A human or an agent does not hand-build a production
  artifact.
- The build emits **provenance attestation** — what source commit, what builder,
  what inputs produced this artifact (a SLSA-style provenance record).
- **Branch protection** — `main` and `develop` are protected; production
  artifacts build only from reviewed, merged source
  ([docs/governance/release-governance.md](../governance/release-governance.md)).
- CI's own secrets are scoped, short-lived, and least-privilege
  ([service-authentication.md](service-authentication.md) §4); a compromised CI
  job has a small blast radius.

## 6. Runtime provenance

- A running workload can be traced back to its artifact, its SBOM, its
  provenance attestation, and its source commit.
- This closes the loop: at any moment, for anything running in production, NEXT
  can answer **"what exactly is this, where did it come from, and what is in
  it"**.

## 7. Package governance

- Internal shared packages follow the monorepo dependency rules
  ([docs/standards/monorepo-governance.md](../standards/monorepo-governance.md)) —
  no forbidden cross-imports, one purpose per package.
- A dependency that would introduce a forbidden cross-import or duplicate an
  existing capability is rejected regardless of merit.
- Generated code (`gen/go`) is reproducible from schemas — not a trust gap.

## 8. AI model provenance

Models are supply-chain artifacts too:

- a production model is **registered** with a version, a model card, and
  provenance ([ai-security.md](ai-security.md), [docs/standards/ai-system-standards.md](../standards/ai-system-standards.md));
- an unregistered, unknown-provenance model is treated as an untrusted artifact
  and does not serve production traffic.

## 9. Prohibited patterns

- ✗ An unsigned image or artifact running in production.
- ✗ A deploy from un-reviewed, un-merged source.
- ✗ A production artifact built outside trusted CI (hand-built).
- ✗ An unpinned / "latest" dependency in a production build.
- ✗ Adding a dependency with a known unpatched vulnerability, or without review.
- ✗ A build artifact with no SBOM and no provenance attestation.
- ✗ Signing keys on a developer or agent machine.
- ✗ A production model with no registry entry or provenance.

## Related

- [infrastructure-hardening.md](infrastructure-hardening.md) · [docs/standards/monorepo-governance.md](../standards/monorepo-governance.md) · [docs/governance/release-governance.md](../governance/release-governance.md) · [multi-agent-security-governance.md](multi-agent-security-governance.md)
