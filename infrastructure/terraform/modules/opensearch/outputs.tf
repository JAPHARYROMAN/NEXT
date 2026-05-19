output "endpoint" { value = aws_opensearch_domain.this.endpoint }
output "kibana_endpoint" { value = aws_opensearch_domain.this.dashboard_endpoint }
output "security_group_id" { value = aws_security_group.os.id }
