variable "name" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "kubernetes_version" {
  type    = string
  default = "1.31"
}
variable "public_access_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}
variable "enable_karpenter" {
  type    = bool
  default = true
}
variable "enable_gpu_node_pool" {
  type    = bool
  default = false
}
