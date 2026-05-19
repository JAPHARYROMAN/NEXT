variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "engine_version" { type = string, default = "OpenSearch_2.17" }
variable "master_instances" { type = number, default = 3 }
variable "data_instances" { type = number, default = 3 }
variable "data_instance_type" { type = string, default = "r7g.large.search" }
variable "warm_enabled" { type = bool, default = false }
variable "domain" { type = string }
