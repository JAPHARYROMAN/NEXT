# NEXT Redis via ElastiCache. Cluster-mode-enabled for sharding from day one.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.70" }
  }
}

resource "aws_kms_key" "redis" {
  description         = "ElastiCache encryption — ${var.name}"
  enable_key_rotation = true
}

resource "aws_security_group" "redis" {
  name   = "${var.name}-redis"
  vpc_id = var.vpc_id
}

resource "aws_elasticache_subnet_group" "this" {
  name       = var.name
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id       = var.name
  description                = "NEXT Redis — ${var.name}"
  engine                     = "redis"
  engine_version             = "7.1"
  node_type                  = var.node_type
  parameter_group_name       = "default.redis7.cluster.on"
  num_node_groups            = var.num_shards
  replicas_per_node_group    = var.num_replicas_per_shard
  port                       = 6379
  automatic_failover_enabled = true
  multi_az_enabled           = true

  subnet_group_name  = aws_elasticache_subnet_group.this.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                 = aws_kms_key.redis.arn

  snapshot_retention_limit = 7
  snapshot_window          = "03:00-04:00"

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.slowlog.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }

  tags = {
    domain  = var.domain
    service = var.name
  }
}

resource "aws_cloudwatch_log_group" "slowlog" {
  name              = "/aws/elasticache/${var.name}/slow"
  retention_in_days = 14
}
