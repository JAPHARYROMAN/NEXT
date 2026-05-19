output "id" { value = aws_s3_bucket.this.id }
output "arn" { value = aws_s3_bucket.this.arn }
output "regional_domain_name" { value = aws_s3_bucket.this.bucket_regional_domain_name }
output "kms_key_arn" { value = aws_kms_key.this.arn }
