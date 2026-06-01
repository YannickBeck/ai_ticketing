// ============================================================
// Azure Key Vault — Secrets Management
// ============================================================

param location string
param env string

@secure()
param pgZammadPassword string

@secure()
param pgN8nPassword string

@secure()
param zammadSecretToken string

@secure()
param n8nEncryptionKey string

resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: 'kv-aiticketing-${env}'  // max 24 Zeichen
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enableRbacAuthorization: true   // RBAC statt Access Policies (empfohlen)
    enabledForDeployment: false
    enabledForTemplateDeployment: true
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'       // MVP: offen, später Private Endpoint
    }
  }
}

resource secretPgZammad 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  parent: keyVault
  name: 'pg-zammad-password'
  properties: { value: pgZammadPassword }
}

resource secretPgN8n 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  parent: keyVault
  name: 'pg-n8n-password'
  properties: { value: pgN8nPassword }
}

resource secretZammadToken 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  parent: keyVault
  name: 'zammad-secret-token'
  properties: { value: zammadSecretToken }
}

resource secretN8nKey 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  parent: keyVault
  name: 'n8n-encryption-key'
  properties: { value: n8nEncryptionKey }
}

output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
