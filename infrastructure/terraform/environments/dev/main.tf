# NEXT dev environment. Smaller footprint; shares the same module set as prod for parity.

terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.70" }
  }
  backend "s3" {
    bucket         = "next-tf-state-dev"
    key            = "environments/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "next-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags { tags = { env = "dev", project = "next", managed_by = "terraform" } }
}

locals {
  name = "next-dev"
  azs  = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

module "vpc" {
  source = "../../modules/vpc"
  name   = local.name
  cidr   = "10.20.0.0/16"
  azs    = local.azs
}

module "eks" {
  source             = "../../modules/eks"
  name               = local.name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  kubernetes_version = "1.31"
  enable_karpenter   = true
}

# Dev keeps stateful tiers small to control cost.
module "rds_shared" {
  source            = "../../modules/rds-postgres"
  name              = "${local.name}-shared"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  instance_class    = "db.t4g.medium"
  allocated_storage = 50
  multi_az          = false
  domain            = "platform"
}

module "redis_shared" {
  source     = "../../modules/elasticache-redis"
  name       = "${local.name}-shared"
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  node_type  = "cache.t4g.small"
  num_shards = 1
  domain     = "platform"
}

module "msk" {
  source         = "../../modules/msk-kafka"
  name           = local.name
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  num_brokers    = 3
  broker_size    = "kafka.t3.small"
  storage_gb     = 50
  tiered_storage = false
}

output "eks_cluster_name" { value = module.eks.cluster_name }
