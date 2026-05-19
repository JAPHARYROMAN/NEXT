# NEXT Kafka via AWS MSK. KRaft, tiered storage, mTLS + SASL/SCRAM, KMS encryption.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.70" }
  }
}

resource "aws_kms_key" "msk" {
  description         = "MSK encryption — ${var.name}"
  enable_key_rotation = true
}

resource "aws_security_group" "msk" {
  name   = "${var.name}-msk"
  vpc_id = var.vpc_id
}

resource "aws_msk_configuration" "this" {
  name              = "${var.name}-config"
  kafka_versions    = [var.kafka_version]
  server_properties = <<-EOT
    auto.create.topics.enable=false
    default.replication.factor=3
    min.insync.replicas=2
    num.partitions=12
    log.retention.hours=72
    unclean.leader.election.enable=false
    log.message.timestamp.type=LogAppendTime
  EOT
}

resource "aws_msk_cluster" "this" {
  cluster_name           = var.name
  kafka_version          = var.kafka_version
  number_of_broker_nodes = var.num_brokers

  broker_node_group_info {
    instance_type   = var.broker_size
    client_subnets  = var.subnet_ids
    security_groups = [aws_security_group.msk.id]
    storage_info {
      ebs_storage_info { volume_size = var.storage_gb }
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.this.arn
    revision = aws_msk_configuration.this.latest_revision
  }

  encryption_info {
    encryption_at_rest_kms_key_arn = aws_kms_key.msk.arn
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  client_authentication {
    sasl {
      iam   = true
      scram = true
    }
    tls {}
  }

  storage_mode = var.tiered_storage ? "TIERED" : "LOCAL"

  enhanced_monitoring = "PER_TOPIC_PER_PARTITION"

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.msk.name
      }
    }
  }

  open_monitoring {
    prometheus {
      jmx_exporter { enabled_in_broker = true }
      node_exporter { enabled_in_broker = true }
    }
  }
}

resource "aws_cloudwatch_log_group" "msk" {
  name              = "/aws/msk/${var.name}"
  retention_in_days = 30
}
