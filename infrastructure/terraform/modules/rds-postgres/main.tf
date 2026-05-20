# NEXT Postgres module. Per-service instance; Multi-AZ; KMS-encrypted; auto-minor-version.

terraform {
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.70" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

resource "random_password" "master" {
  length  = 32
  special = false
}

resource "aws_kms_key" "this" {
  description         = "RDS storage encryption — ${var.name}"
  enable_key_rotation = true
}

resource "aws_db_subnet_group" "this" {
  name       = var.name
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "this" {
  name        = "${var.name}-rds"
  vpc_id      = var.vpc_id
  description = "RDS ingress from cluster nodes"
}

resource "aws_db_instance" "this" {
  identifier                            = var.name
  engine                                = "postgres"
  engine_version                        = var.engine_version
  instance_class                        = var.instance_class
  allocated_storage                     = var.allocated_storage
  max_allocated_storage                 = var.allocated_storage * 4
  storage_type                          = "gp3"
  storage_encrypted                     = true
  kms_key_id                            = aws_kms_key.this.arn
  db_name                               = replace(var.name, "-", "_")
  username                              = "next_admin"
  password                              = random_password.master.result
  multi_az                              = var.multi_az
  vpc_security_group_ids                = [aws_security_group.this.id]
  db_subnet_group_name                  = aws_db_subnet_group.this.name
  publicly_accessible                   = false
  backup_retention_period               = 35
  backup_window                         = "03:00-04:00"
  maintenance_window                    = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot                 = true
  deletion_protection                   = true
  skip_final_snapshot                   = false
  final_snapshot_identifier             = "${var.name}-final"
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  monitoring_interval                   = 30
  enabled_cloudwatch_logs_exports       = ["postgresql"]
  auto_minor_version_upgrade            = true

  apply_immediately = false

  tags = {
    domain  = var.domain
    service = var.name
  }
}
