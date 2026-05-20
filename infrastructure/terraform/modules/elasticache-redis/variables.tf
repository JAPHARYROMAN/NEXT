variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "node_type" {
  type    = string
  default = "cache.r7g.large"
}
variable "num_shards" {
  type    = number
  default = 1
}
variable "num_replicas_per_shard" {
  type    = number
  default = 1
}
variable "domain" {
  type = string
}
