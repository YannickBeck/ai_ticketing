// ============================================================
// Azure Key Vault — Secrets Management
// ============================================================

param location string
param env string

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

// Ausgabe: Container Apps managed identity erhält Key Vault Secrets User Rolle
// (wird in containerApps.bicep via roleAssignment gesetzt)

output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
