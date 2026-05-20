---
name: Architecture change request
about: Request a change that crosses a service, contract, runtime, or domain boundary
title: 'Arch: <short summary>'
labels: ['architecture']
---

<!--
  Use this for a change that is architectural per
  docs/governance/architecture-governance.md §1 — a new service, an event
  contract change, a cross-domain or cross-runtime change. If the change needs
  an ADR, file an "ADR proposal" instead (or as well).
-->

## Summary

<!-- What change, and why. -->

## Classification

- [ ] Crosses a service boundary
- [ ] Changes an event contract / proto schema
- [ ] Changes a database schema other services observe
- [ ] Crosses a runtime boundary (needs the runtime exception process)
- [ ] Crosses a domain boundary (needs a recorded cross-domain assignment)
- [ ] Supersedes an existing ADR — which: \_\_\_\_

## Owning domain(s)

<!-- Per ADR 0034. Cross-domain changes name both owners. -->

## Does this need an ADR?

<!-- If yes, link the ADR proposal issue. Unsure ⇒ yes. -->

## Risk & rollback

<!-- Blast radius, and how the change is reverted. -->
