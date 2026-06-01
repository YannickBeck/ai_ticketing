// ============================================================
// Azure Container Apps Environment
// Services: n8n | Zammad | Redis | Elasticsearch
// ============================================================

param location string
param env string
param logAnalyticsWorkspaceId string
@secure()
param logAnalyticsWorkspaceKey string
param pgHost string
param keyVaultName string
param managedIdentityId string

// ─── Container Apps Environment ───────────────────────────────

resource caEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-ai-ticketing-${env}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspaceId
        sharedKey: logAnalyticsWorkspaceKey
      }
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// ─── Redis (Zammad benötigt Redis für Sessions/Jobs) ──────────

resource redisApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-redis-${env}'
  location: location
  properties: {
    managedEnvironmentId: caEnv.id
    configuration: {
      ingress: {
        external: false
        targetPort: 6379
        transport: 'tcp'
      }
    }
    template: {
      containers: [
        {
          name: 'redis'
          image: 'redis:7-alpine'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          args: ['redis-server', '--appendonly', 'yes']
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

// ─── Elasticsearch (Zammad Volltext-Suche) ───────────────────

resource elasticsearchApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-elasticsearch-${env}'
  location: location
  properties: {
    managedEnvironmentId: caEnv.id
    configuration: {
      ingress: {
        external: false
        targetPort: 9200
        transport: 'http'
      }
    }
    template: {
      containers: [
        {
          name: 'elasticsearch'
          image: 'docker.elastic.co/elasticsearch/elasticsearch:8.11.0'
          env: [
            { name: 'discovery.type', value: 'single-node' }
            { name: 'xpack.security.enabled', value: 'false' }
            { name: 'ES_JAVA_OPTS', value: '-Xms512m -Xmx512m' }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

// ─── Zammad (3 Prozesse: railsserver + scheduler + websocket) ────
// ghcr.io/zammad/zammad:6.3.0 benötigt expliziten Command pro Prozess.
// Init-Container läuft DB-Migrations idempotent vor dem railsserver.

var zammadImage = 'ghcr.io/zammad/zammad:6.3.0'

var zammadSecrets = [
  {
    name: 'pg-zammad-password'
    keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/pg-zammad-password'
    identity: managedIdentityId
  }
  {
    name: 'zammad-secret-token'
    keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/zammad-secret-token'
    identity: managedIdentityId
  }
]

var zammadEnv = [
  { name: 'POSTGRESQL_HOST', value: pgHost }
  { name: 'POSTGRESQL_PORT', value: '5432' }
  { name: 'POSTGRESQL_DB', value: 'zammad' }
  { name: 'POSTGRESQL_USER', value: 'zammad_user' }
  { name: 'POSTGRESQL_PASS', secretRef: 'pg-zammad-password' }
  { name: 'POSTGRESQL_OPTIONS', value: 'sslmode=require' }
  { name: 'REDIS_URL', value: 'redis://ca-redis-${env}:6379' }
  { name: 'ELASTICSEARCH_HOST', value: 'ca-elasticsearch-${env}' }
  { name: 'ELASTICSEARCH_PORT', value: '9200' }
  { name: 'ELASTICSEARCH_SSL', value: 'false' }
  { name: 'ZAMMAD_SECRET_TOKEN', secretRef: 'zammad-secret-token' }
  { name: 'RAILS_ENV', value: 'production' }
]

// Railsserver — öffentlich erreichbar, läuft DB-Init vor dem Start
resource zammadApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-zammad-${env}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${managedIdentityId}': {} }
  }
  dependsOn: [redisApp, elasticsearchApp]
  properties: {
    managedEnvironmentId: caEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        corsPolicy: { allowedOrigins: ['*'] }
      }
      secrets: zammadSecrets
    }
    template: {
      initContainers: [
        {
          name: 'zammad-init'
          image: zammadImage
          command: ['/bin/sh', '-c', 'zammad run init']
          env: zammadEnv
          resources: { cpu: json('0.5'), memory: '1Gi' }
        }
      ]
      containers: [
        {
          name: 'zammad-railsserver'
          image: zammadImage
          command: ['/bin/sh', '-c', 'zammad run railsserver']
          env: union(zammadEnv, [{ name: 'ZAMMAD_RAILSSERVER_PORT', value: '3000' }])
          resources: { cpu: json('1.0'), memory: '2Gi' }
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 2 }
    }
  }
}

// Scheduler — Hintergrund-Jobs (keine Ingress nötig)
resource zammadSchedulerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-zammad-scheduler-${env}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${managedIdentityId}': {} }
  }
  dependsOn: [zammadApp]
  properties: {
    managedEnvironmentId: caEnv.id
    configuration: {
      secrets: zammadSecrets
    }
    template: {
      containers: [
        {
          name: 'zammad-scheduler'
          image: zammadImage
          command: ['/bin/sh', '-c', 'zammad run scheduler']
          env: zammadEnv
          resources: { cpu: json('0.5'), memory: '1Gi' }
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 1 }
    }
  }
}

// WebSocket-Server — intern erreichbar über Port 6042
resource zammadWebsocketApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-zammad-websocket-${env}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${managedIdentityId}': {} }
  }
  dependsOn: [zammadApp]
  properties: {
    managedEnvironmentId: caEnv.id
    configuration: {
      ingress: {
        external: false
        targetPort: 6042
        transport: 'http'
      }
      secrets: zammadSecrets
    }
    template: {
      containers: [
        {
          name: 'zammad-websocket'
          image: zammadImage
          command: ['/bin/sh', '-c', 'zammad run websocket']
          env: zammadEnv
          resources: { cpu: json('0.5'), memory: '1Gi' }
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 1 }
    }
  }
}

// ─── n8n (Workflow Engine) ────────────────────────────────────

resource n8nApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-n8n-${env}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: caEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 5678
        transport: 'http'
      }
      secrets: [
        {
          name: 'n8n-encryption-key'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/n8n-encryption-key'
          identity: managedIdentityId
        }
        {
          name: 'pg-n8n-password'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/pg-n8n-password'
          identity: managedIdentityId
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'n8n'
          image: 'n8nio/n8n:1.44.0'
          env: [
            { name: 'N8N_HOST', value: 'ca-n8n-${env}.${caEnv.properties.defaultDomain}' }
            { name: 'N8N_PORT', value: '5678' }
            { name: 'N8N_PROTOCOL', value: 'https' }
            { name: 'N8N_ENCRYPTION_KEY', secretRef: 'n8n-encryption-key' }
            // PostgreSQL Backend
            { name: 'DB_TYPE', value: 'postgresdb' }
            { name: 'DB_POSTGRESDB_HOST', value: pgHost }
            { name: 'DB_POSTGRESDB_PORT', value: '5432' }
            { name: 'DB_POSTGRESDB_DATABASE', value: 'n8n' }
            { name: 'DB_POSTGRESDB_USER', value: 'n8n_user' }
            { name: 'DB_POSTGRESDB_PASSWORD', secretRef: 'pg-n8n-password' }
            { name: 'DB_POSTGRESDB_SSL_ENABLED', value: 'true' }
            // Execution Logs speichern
            { name: 'EXECUTIONS_DATA_SAVE_ON_SUCCESS', value: 'all' }
            { name: 'EXECUTIONS_DATA_SAVE_ON_ERROR', value: 'all' }
            { name: 'EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS', value: 'true' }
            { name: 'EXECUTIONS_DATA_MAX_AGE', value: '336' }  // 14 Tage in Stunden
            // Timezone
            { name: 'GENERIC_TIMEZONE', value: 'Europe/Berlin' }
            // n8n API aktivieren (für GitHub Actions Export)
            { name: 'N8N_PUBLIC_API_DISABLED', value: 'false' }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

// Outputs
output n8nUrl string = 'https://${n8nApp.properties.configuration.ingress.fqdn}'
output zammadUrl string = 'https://${zammadApp.properties.configuration.ingress.fqdn}'
output caEnvId string = caEnv.id
