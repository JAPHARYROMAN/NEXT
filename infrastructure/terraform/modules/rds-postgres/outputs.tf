output "endpoint" { value = aws_db_instance.this.endpoint }
output "address" { value = aws_db_instance.this.address }
output "port" { value = aws_db_instance.this.port }
output "kms_key_arn" { value = aws_kms_key.this.arn }
output "security_group_id" { value = aws_security_group.this.id }
output "master_password_secret_arn" {
  value     = random_password.master.result
  sensitive = true
}
