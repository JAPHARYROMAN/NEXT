variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "num_brokers" {
  type    = number
  default = 3
}
variable "broker_size" {
  type    = string
  default = "kafka.m7g.large"
}
variable "storage_gb" {
  type    = number
  default = 100
}
variable "kafka_version" {
  type    = string
  default = "3.7.x"
}
variable "tiered_storage" {
  type    = bool
  default = true
}
