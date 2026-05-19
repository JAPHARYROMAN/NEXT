# NEXT S3 bucket module. Versioned, encrypted, with lifecycle rules.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.70" }
  }
}

resource "aws_kms_key" "this" {
  description         = "S3 SSE-KMS — ${var.name}"
  enable_key_rotation = true
}

resource "aws_s3_bucket" "this" {
  bucket = var.name
  tags   = { domain = var.domain }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.this.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  dynamic "rule" {
    for_each = var.abort_incomplete_multipart_days > 0 ? [1] : []
    content {
      id     = "abort-incomplete"
      status = "Enabled"
      filter {}
      abort_incomplete_multipart_upload { days_after_initiation = var.abort_incomplete_multipart_days }
    }
  }

  dynamic "rule" {
    for_each = var.lifecycle_to_ia_days > 0 ? [1] : []
    content {
      id     = "transition-to-ia"
      status = "Enabled"
      filter {}
      transition {
        days          = var.lifecycle_to_ia_days
        storage_class = "STANDARD_IA"
      }
      dynamic "transition" {
        for_each = var.lifecycle_to_glacier_days > 0 ? [1] : []
        content {
          days          = var.lifecycle_to_glacier_days
          storage_class = "GLACIER"
        }
      }
      noncurrent_version_expiration { noncurrent_days = 90 }
    }
  }
}

resource "aws_s3_bucket_logging" "this" {
  count         = var.access_logs_bucket != "" ? 1 : 0
  bucket        = aws_s3_bucket.this.id
  target_bucket = var.access_logs_bucket
  target_prefix = "${var.name}/"
}
