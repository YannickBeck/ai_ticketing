// ============================================================
// Azure OpenAI Service
// Region: Sweden Central (GPT-4o + Embeddings verfügbar, EU)
// ============================================================

param env string

// Azure OpenAI ist nur in bestimmten Regionen verfügbar
// Sweden Central hat GPT-4o + text-embedding-3-large
var openaiLocation = 'swedencentral'

resource openai 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: 'oai-ai-ticketing-${env}'
  location: openaiLocation
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    customSubDomainName: 'oai-ai-ticketing-${env}'
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

// GPT-4o Deployment — Klassifikation, Drafts, Zusammenfassung, Voice Summary
resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  name: 'gpt-4o'
  parent: openai
  sku: {
    name: 'Standard'
    capacity: 10  // 10k TPM — für MVP ausreichend, bei Bedarf erhöhen
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-11-20'
    }
    versionUpgradeOption: 'OnceCurrentVersionExpired'
  }
}

// text-embedding-3-large — RAG Embeddings (3072 Dimensionen)
resource embeddingDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  name: 'text-embedding-3-large'
  parent: openai
  dependsOn: [gpt4oDeployment]  // Deployments sequentiell anlegen
  sku: {
    name: 'Standard'
    capacity: 10
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'text-embedding-3-large'
      version: '1'
    }
    versionUpgradeOption: 'OnceCurrentVersionExpired'
  }
}

output endpoint string = openai.properties.endpoint
output openaiId string = openai.id
