# Phase 15A Infrastructure Security Hardening

Phase 15A remediates the Terraform findings surfaced by the Security workflow
after workflow startup and runtime execution were stabilized. The work is scoped
to runtime infrastructure posture only; no application or product code changed.

## Findings

| Finding | Affected resource | Risk level | Remediation applied | Rationale | Residual risk | Future follow-up |
| --- | --- | --- | --- | --- | --- | --- |
| `terraform.aws.security.aws-cloudfront-insecure-tls` | `aws_cloudfront_distribution.this` in `infrastructure/terraform/modules/cloudfront/main.tf` | Medium | Set `minimum_protocol_version = "TLSv1.2_2021"` on the viewer certificate. | The previous default certificate block did not explicitly enforce a modern viewer TLS policy. TLS 1.2 2021 preserves broad modern client compatibility while preventing legacy TLS negotiation. | Legacy clients that cannot negotiate TLS 1.2 will no longer connect. This is acceptable for the public edge security baseline. | Revisit when moving from the CloudFront default certificate to the production custom domain certificate; keep the TLS floor at least as strict. |
| `terraform.lang.security.eks-public-endpoint-enabled` | `aws_eks_cluster.this` in `infrastructure/terraform/modules/eks/main.tf` | High | Set `endpoint_public_access = false` and keep `endpoint_private_access = true`; removed the open `public_access_cidrs` variable. | The previous module exposed the Kubernetes API publicly and defaulted access to `0.0.0.0/0`. Private-only control plane access aligns with the platform's zero-trust infrastructure posture and avoids relying on broad internet CIDR filtering. | Operators and automation must reach the EKS API from private network paths such as VPC-connected runners, VPN, bastion, or SSM access. Public emergency access is not retained in this module. | If a future environment requires public endpoint access, introduce an environment-specific module variant with documented approval and narrow CIDRs rather than re-opening the shared default. |

## Compatibility Notes

CloudFront viewer TLS now requires TLS 1.2 or newer under the AWS
`TLSv1.2_2021` security policy. This may exclude very old browsers, embedded
clients, and legacy TLS stacks. The policy is appropriate for NEXT's public edge
because it reduces downgrade exposure without affecting modern browsers or app
clients.

EKS API access is private-only. Terraform can still create and update AWS EKS
resources through the AWS API, but direct Kubernetes API operations must run
from a network path that can reach the private endpoint. This matches the
infrastructure security doctrine in the NEXT constitution: secure, resilient,
and production-grade infrastructure defaults.

## Suppressions

No Semgrep suppressions were added. Both findings were remediated directly.
