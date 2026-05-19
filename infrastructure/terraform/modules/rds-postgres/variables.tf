variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "instance_class" {
  type    = string
  default = "db.r7g.large"
}
variable "allocated_storage" {
  type    = number
  default = 100
}
variable "engine_version" {
  type    = string
  default = "16.4"
}
variable "multi_az" {
  type    = bool
  default = true
}
variable "domain" {
  type        = string
  description = "Owning domain tag, e.g. identity, media, payments."
}
