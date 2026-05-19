# NEXT OpenSearch domain. Hot-warm-cold with UltraWarm + Cold tiers.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.70" }
  }
}

resource "aws_kms_key" "os" {
  description         = "OpenSearch encryption — ${var.name}"
  enable_key_rotation = true
}

resource "aws_security_group" "os" {
  name   = "${var.name}-opensearch"
  vpc_id = var.vpc_id
}

resource "aws_opensearch_domain" "this" {
  domain_name    = var.name
  engine_version = var.engine_version

  cluster_config {
    dedicated_master_enabled = true
    dedicated_master_count   = var.master_instances
    dedicated_master_type    = "r7g.large.search"
    instance_type            = var.data_instance_type
    instance_count           = var.data_instances
    zone_awareness_enabled   = true
    zone_awareness_config {
      availability_zone_count = 3
    }
    warm_enabled = var.warm_enabled
    warm_count   = var.warm_enabled ? 3 : null
    warm_type    = var.warm_enabled ? "ultrawarm1.medium.search" : null
  }

  vpc_options {
    subnet_ids         = slice(var.subnet_ids, 0, 3)
    security_group_ids = [aws_security_group.os.id]
  }

  ebs_options {
    ebs_enabled = true
    volume_type = "gp3"
    volume_size = 200
    iops        = 3000
    throughput  = 250
  }

  encrypt_at_rest {
    enabled    = true
    kms_key_id = aws_kms_key.os.arn
  }

  node_to_node_encryption { enabled = true }
  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-PFS-2023-10"
  }

  log_publishing_options {
    log_type                 = "ES_APPLICATION_LOGS"
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.os_app.arn
    enabled                  = true
  }

  log_publishing_options {
    log_type                 = "SEARCH_SLOW_LOGS"
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.os_slow.arn
    enabled                  = true
  }

  tags = { domain = var.domain }
}

resource "aws_cloudwatch_log_group" "os_app" {
  name              = "/aws/opensearch/${var.name}/app"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "os_slow" {
  name              = "/aws/opensearch/${var.name}/slow"
  retention_in_days = 14
}
