# Vault policy — auth-service. Read-only on its own paths; sign-only on Transit keys.

path "kv/data/{{identity.entity.aliases.<k8s_auth_mount>.metadata.service_account_namespace}}/auth-service/*" {
  capabilities = ["read"]
}

path "database/creds/auth-service" {
  capabilities = ["read"]
}

path "transit/sign/auth-jwt-signing-key" {
  capabilities = ["update"]
}

path "transit/keys/auth-jwt-signing-key" {
  capabilities = ["read"]
}

# Deny everything else explicitly.
path "*" {
  capabilities = ["deny"]
}
