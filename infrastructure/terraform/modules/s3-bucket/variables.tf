variable "name" { type = string }
variable "domain" { type = string }
variable "abort_incomplete_multipart_days" {
  type    = number
  default = 0
}
variable "lifecycle_to_ia_days" {
  type    = number
  default = 0
}
variable "lifecycle_to_glacier_days" {
  type    = number
  default = 0
}
variable "access_logs_bucket" {
  type    = string
  default = ""
}
