// ============================================================
// Managed Identity für Container Apps
// Erlaubt Key Vault Zugriff ohne Credentials in Containern
// ============================================================

param location string
param env string

resource caIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-ai-ticketing-${env}'
  location: location
}

resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(caIdentity.id, 'Key Vault Secrets User')
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: caIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output identityId string = caIdentity.id
output identityPrincipalId string = caIdentity.properties.principalId
