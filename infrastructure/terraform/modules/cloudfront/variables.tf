variable "name" { type = string }
variable "origins" {
  type        = map(string)
  description = "Map of origin name → origin domain (e.g. media = bucket.s3..., api = api.next.io)."
}
