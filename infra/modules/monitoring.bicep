// ============================================================
// Monitoring: Log Analytics Workspace + Application Insights
// ============================================================

param location string
param env string

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'law-ai-ticketing-${env}'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-ai-ticketing-${env}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    RetentionInDays: 30
  }
}

// Alert: n8n Workflow Fehler (über 5 Fehler in 15 Min)
resource workflowErrorAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-workflow-errors-${env}'
  location: 'global'
  properties: {
    description: 'Mehr als 5 n8n Workflow-Fehler in 15 Minuten'
    severity: 2
    enabled: true
    scopes: [appInsights.id]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [{
        name: 'WorkflowErrors'
        metricName: 'exceptions/count'
        operator: 'GreaterThan'
        threshold: 5
        timeAggregation: 'Count'
      }]
    }
  }
}

output workspaceId string = logAnalyticsWorkspace.properties.customerId
output workspaceKey string = logAnalyticsWorkspace.listKeys().primarySharedKey
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
