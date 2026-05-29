// ============================================================
// Azure Blob Storage — Anhänge & Voice Audio
// ============================================================

param location string
param env string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'staiticketing${env}'   // Storage Name: lowercase, kein Bindestrich, max 24 Zeichen
  location: location
  sku: {
    name: 'Standard_LRS'        // Locally redundant — für MVP ausreichend
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    accessTier: 'Hot'
    allowBlobPublicAccess: false  // Kein öffentlicher Zugriff
    encryption: {
      services: {
        blob: { enabled: true }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  name: 'default'
  parent: storageAccount
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 30
    }
  }
}

// Container: E-Mail-Anhänge
resource attachmentsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: 'attachments'
  parent: blobService
  properties: {
    publicAccess: 'None'
  }
}

// Container: Voice Audio Dateien
resource voiceAudioContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: 'voice-audio'
  parent: blobService
  properties: {
    publicAccess: 'None'
  }
}

// Container: Knowledge Documents (PDFs, Markdown)
resource knowledgeContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: 'knowledge-docs'
  parent: blobService
  properties: {
    publicAccess: 'None'
  }
}

// Lifecycle Policy: Alte Voice-Dateien nach 90 Tagen löschen (DSGVO)
resource lifecyclePolicy 'Microsoft.Storage/storageAccounts/managementPolicies@2023-01-01' = {
  name: 'default'
  parent: storageAccount
  properties: {
    policy: {
      rules: [
        {
          name: 'DeleteOldVoiceFiles'
          enabled: true
          type: 'Lifecycle'
          definition: {
            filters: {
              blobTypes: ['blockBlob']
              prefixMatch: ['voice-audio/']
            }
            actions: {
              baseBlob: {
                delete: { daysAfterModificationGreaterThan: 90 }
              }
            }
          }
        }
      ]
    }
  }
}

output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
output blobEndpoint string = storageAccount.properties.primaryEndpoints.blob
