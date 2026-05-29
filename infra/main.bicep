// ============================================================
// AI Ticketing Buddy — Azure Infrastructure Entry Point
// Region: West Europe (EU / DSGVO)
// ============================================================

targetScope = 'subscription'

@description('Environment name (prod, staging, dev)')
param env string = 'prod'

@description('Azure region for all resources')
param location string = 'westeurope'

@description('PostgreSQL administrator login')
param pgAdminLogin string

@secure()
@description('PostgreSQL administrator password')
param pgAdminPassword string

// Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: 'rg-ai-ticketing-${env}'
  location: location
}

// Log Analytics Workspace (needed by App Insights + Container Apps)
module logAnalytics 'modules/monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    env: env
  }
}

// Key Vault
module keyVault 'modules/keyVault.bicep' = {
  name: 'keyVault'
  scope: rg
  params: {
    location: location
    env: env
  }
}

// PostgreSQL Flexible Server
module postgres 'modules/postgres.bicep' = {
  name: 'postgres'
  scope: rg
  params: {
    location: location
    env: env
    adminLogin: pgAdminLogin
    adminPassword: pgAdminPassword
  }
}

// Azure Blob Storage
module storage 'modules/storage.bicep' = {
  name: 'storage'
  scope: rg
  params: {
    location: location
    env: env
  }
}

// Azure OpenAI Service (Sweden Central — GPT-4o + Embeddings)
module openai 'modules/openai.bicep' = {
  name: 'openai'
  scope: rg
  params: {
    env: env
  }
}

// Azure AI Speech Service
module speech 'modules/speech.bicep' = {
  name: 'speech'
  scope: rg
  params: {
    location: location
    env: env
  }
}

// Container Apps Environment + n8n + Zammad + Redis + Elasticsearch
module containerApps 'modules/containerApps.bicep' = {
  name: 'containerApps'
  scope: rg
  params: {
    location: location
    env: env
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
    logAnalyticsWorkspaceKey: logAnalytics.outputs.workspaceKey
    pgHost: postgres.outputs.pgHost
    keyVaultName: keyVault.outputs.keyVaultName
  }
}

// Outputs
output n8nUrl string = containerApps.outputs.n8nUrl
output zammadUrl string = containerApps.outputs.zammadUrl
output pgHost string = postgres.outputs.pgHost
output openaiEndpoint string = openai.outputs.endpoint
output storageAccountName string = storage.outputs.storageAccountName
