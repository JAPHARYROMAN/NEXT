---
name: Incident report
about: Record a production incident for tracking and post-incident review
title: 'Incident: <short summary>'
labels: ['incident']
---

<!--
  Use this to record an incident. The live response happens in the incident
  channel, not here — this issue is the durable record and the home of the
  post-incident review. See docs/governance/incident-governance.md and
  docs/resilience/incident-response.md.
-->

## Summary

<!-- What happened, in plain language. -->

## Severity

<!-- SEV1 critical | SEV2 major | SEV3 minor | SEV4 low -->

## Incident Commander

<!-- The human IC who owns this incident. -->

## User impact

<!-- Who was affected, how, for how long. Quantify if possible. -->

## Timeline

<!-- Detect → declare → mitigate → resolve, with timestamps. -->

## Mitigation

<!-- What stopped the user harm (rollback, failover, degrade, flag-off). -->

## Post-incident review

<!-- For SEV1/SEV2: link the blameless review. Action items become tracked
     debt items where architectural. -->
