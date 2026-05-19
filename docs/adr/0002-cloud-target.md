# 0002. AWS as primary cloud

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/sre
- **Tags**: infrastructure, cloud

## Context

NEXT must run on a hyperscaler with global edge presence, mature managed services across the data tier, a deep GPU inventory, and a strong compliance posture. We are not interested in cloud-agnostic architecture as a goal — we will design portably where the cost is low, and we will exploit the chosen cloud's strengths where it matters.

## Decision

**AWS** is the primary cloud. All v1 infrastructure runs in AWS, with `us-east-1` as the home region and `us-west-2` reserved for v2 multi-region.

## Alternatives considered

- **GCP** — strongest for GPU + AI workloads (TPUs, A3/A4 instances), excellent global network, but smaller managed-services breadth for our event + data stack and a smaller existing talent pool. Strong second; revisit if AI workload economics shift.
- **Multi-cloud from day one** — rejected. Doubles operational surface, blocks deep use of any provider's primitives, and creates a permanent integration tax we cannot afford at this stage.
- **On-prem / colo** — rejected for v1. Capital and operational cost dwarfs cloud spend until we are at scale, and we lose the elasticity that AI workloads demand.

## Consequences

### Positive
- Mature managed services: EKS, RDS, MSK, S3, CloudFront, KMS, ACM.
- Largest GPU inventory of any cloud, including capacity reservations.
- Deepest compliance certifications (SOC 2, PCI, HIPAA, ISO 27001, FedRAMP).
- Largest global edge footprint via CloudFront + Global Accelerator.
- Strongest hire-able talent pool.

### Negative
- Egress economics push us toward keeping compute and data co-located. We pay a per-region cost to expand.
- Vendor lock-in at the managed-service layer. Mitigated by keeping the *application* portable (Kubernetes-native, OSS data primitives).
- AWS GPU availability for the latest accelerators sometimes trails GCP; we mitigate via capacity reservations + a contingency path to GCP for inference-only workloads.

## Implementation notes

- All infrastructure provisioned via Terraform in [`infrastructure/terraform`](../../infrastructure/terraform).
- Cross-account separation: one AWS account per environment (`dev`, `staging`, `prod`, `shared-services`, `security`).
- IAM identity center for federated SSO; no long-lived IAM users for humans.
- Cost tracking via cost categories on the `domain` and `service` tags applied by Terraform modules.
