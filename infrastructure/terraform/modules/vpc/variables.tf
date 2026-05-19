variable "name" { type = string }
variable "cidr" { type = string }
variable "azs"  { type = list(string) }
variable "enable_flow_logs" {
  type    = bool
  default = false
}
