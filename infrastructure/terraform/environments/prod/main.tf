# NEXT production environment — us-east-1
# Calls the composable modules to assemble the full footprint.

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws        = { source = "hashicorp/aws", version = "~> 5.70" }
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.32" }
    helm       = { source = "hashicorp/helm", version = "~> 2.16" }
    random     = { source = "hashicorp/random", version = "~> 3.6" }
  }

  backend "s3" {
    bucket         = "next-tf-state-prod"
    key            = "environments/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "next-tf-locks"
    encrypt        = true
    kms_key_id     = "alias/next-tf-state"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      env           = "prod"
      managed_by    = "terraform"
      project       = "next"
      cost_category = "platform"
    }
  }
}

locals {
  env  = "prod"
  name = "next-${local.env}"

  azs = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

module "vpc" {
  source = "../../modules/vpc"

  name             = local.name
  cidr             = "10.10.0.0/16"
  azs              = local.azs
  enable_flow_logs = true
}

module "eks" {
  source = "../../modules/eks"

  name                = local.name
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  kubernetes_version  = "1.31"
  enable_karpenter    = true
  enable_gpu_node_pool = true
}

module "rds_auth" {
  source = "../../modules/rds-postgres"

  name              = "${local.name}-auth"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  instance_class    = "db.r7g.large"
  allocated_storage = 200
  multi_az          = true
  engine_version    = "16.4"
  domain            = "identity"
}

module "rds_profile" {
  source = "../../modules/rds-postgres"

  name              = "${local.name}-profile"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  instance_class    = "db.r7g.large"
  allocated_storage = 500
  multi_az          = true
  domain            = "identity"
}

module "redis_auth" {
  source = "../../modules/elasticache-redis"

  name       = "${local.name}-auth"
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  node_type  = "cache.r7g.large"
  num_shards = 3
  num_replicas_per_shard = 1
  domain     = "identity"
}

module "msk" {
  source = "../../modules/msk-kafka"

  name           = local.name
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  num_brokers    = 9 # 3 per AZ
  broker_size    = "kafka.m7g.large"
  storage_gb     = 500
  kafka_version  = "3.7.x"
  tiered_storage = true
}

module "s3_media" {
  source = "../../modules/s3-bucket"
  name   = "next-media-prod"
  domain = "media"
  lifecycle_to_ia_days = 30
  lifecycle_to_glacier_days = 365
}

module "s3_uploads" {
  source = "../../modules/s3-bucket"
  name   = "next-uploads-prod"
  domain = "media"
  abort_incomplete_multipart_days = 7
}

module "opensearch" {
  source = "../../modules/opensearch"

  name           = local.name
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  engine_version = "OpenSearch_2.17"
  master_instances = 3
  data_instances = 6
  data_instance_type = "or1.large.search"
  warm_enabled   = true
  domain         = "search"
}

module "cdn" {
  source = "../../modules/cloudfront"
  name   = local.name
  origins = {
    media       = module.s3_media.regional_domain_name
    api         = "api.next.io"
  }
}

output "eks_cluster_name"   { value = module.eks.cluster_name }
output "vpc_id"             { value = module.vpc.vpc_id }
output "msk_bootstrap_brokers" { value = module.msk.bootstrap_brokers }
