// ============================================================
// Azure AI Speech Service — Speech-to-Text für Voice Messages
// ============================================================

param location string
param env string

resource speechService 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: 'speech-ai-ticketing-${env}'
  location: location
  kind: 'SpeechServices'
  sku: {
    name: 'S0'   // Standard Tier — Free Tier (F0) hat 5h/Monat Limit
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    customSubDomainName: 'speech-ai-ticketing-${env}'
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

output speechEndpoint string = speechService.properties.endpoint
output speechRegion string = location
output speechId string = speechService.id
