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

// Redis läuft als Sidecar im Zammad-Pod (localhost:6379).
// Separate TCP-Ingress in ACA Consumption-Environments ist nicht zuverlässig.

// ─── Elasticsearch (separate App — nicht mehr aktiv genutzt) ─────────────────
// Elasticsearch läuft seit Rev. 19 als Sidecar im Zammad-Pod (localhost:9200).
// ACA Envoy-Proxy (port 80) verfälscht PUT/POST-Bodies → sidecar umgeht das.
// Diese separate App kann nach dem nächsten Full-Deploy entfernt werden.
// Behalte sie vorerst damit alte Revisions nicht crashen, falls sie noch laufen.
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
          image: 'docker.elastic.co/elasticsearch/elasticsearch:7.17.22'
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

// ─── Zammad (4 Container: railsserver + scheduler + websocket + ES-sidecar) ──
// Zammad 6.5.4 + Elasticsearch 7.17.22 als Sidecar (localhost:9200).
// ES als Sidecar notwendig: ACA Envoy-Proxy (internes HTTP) verfälscht PUT/POST-Bodies
// und lässt Felder als URL-Query-Parameter bei ES ankommen → Index-Erstellung schlägt fehl.
// Redis läuft ebenfalls als Sidecar im Zammad-Pod (localhost:6379).
// maxReplicas:1 wegen shared in-Pod State (Redis + ES).

var zammadImage = 'ghcr.io/zammad/zammad:6.5.4'

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
  // POSTGRESQL_OPTIONS intentionally omitted — Zammad 6.x appends it directly to the DB name string
  // Redis läuft als Sidecar im selben Pod → localhost
  { name: 'REDIS_URL', value: 'redis://localhost:6379' }
  // Elasticsearch läuft als Sidecar → localhost:9200 (direkt, kein Envoy-Proxy)
  { name: 'ELASTICSEARCH_HOST', value: 'localhost' }
  { name: 'ELASTICSEARCH_PORT', value: '9200' }
  { name: 'ELASTICSEARCH_SSL', value: 'false' }
  { name: 'ZAMMAD_SECRET_TOKEN', secretRef: 'zammad-secret-token' }
  { name: 'RAILS_ENV', value: 'production' }
]

// Zammad — alle Prozesse + Redis-Sidecar + ES-Sidecar in einem Pod
// Railsserver (3000) + Scheduler + WebSocket + Redis (localhost:6379) + ES (localhost:9200)
// maxReplicas:1 wegen shared in-Pod State (Redis + ES).
resource zammadApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-zammad-${env}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${managedIdentityId}': {} }
  }
  dependsOn: [elasticsearchApp]
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
      containers: [
        {
          name: 'redis-sidecar'
          image: 'redis:7-alpine'
          // No --appendonly: YAML würde 'yes' als boolean True parsen → Redis Fehler
          args: ['redis-server']
          resources: { cpu: json('0.25'), memory: '0.5Gi' }
        }
        {
          // Elasticsearch als Sidecar — umgeht ACA Envoy-Proxy der PUT/POST-Bodies verfälscht.
          // ingest-attachment Plugin wird beim Start installiert (für Attachment-Volltext-Suche).
          name: 'elasticsearch-sidecar'
          image: 'docker.elastic.co/elasticsearch/elasticsearch:7.17.22'
          command: ['/bin/bash', '-c']
          args: ['elasticsearch-plugin install --batch ingest-attachment; /usr/local/bin/docker-entrypoint.sh eswrapper']
          env: [
            { name: 'discovery.type', value: 'single-node' }
            { name: 'xpack.security.enabled', value: 'false' }
            { name: 'ES_JAVA_OPTS', value: '-Xms512m -Xmx512m' }
          ]
          resources: { cpu: json('0.5'), memory: '1Gi' }
        }
        {
          // zammad-init läuft vor Puma: db:create wird via sed übersprungen
          // (zammad_user hat kein CREATEDB-Recht — DB wurde bereits durch postgres.bicep angelegt).
          name: 'zammad-railsserver'
          image: zammadImage
          command: ['/bin/bash', '-c']
          args: [
            'sleep 10 && sed -e \'s/.*db:create.*//\' /docker-entrypoint.sh > /tmp/ep.sh && chmod +x /tmp/ep.sh && /tmp/ep.sh zammad-init && exec /docker-entrypoint.sh zammad-railsserver'
          ]
          env: union(zammadEnv, [
            { name: 'ZAMMAD_RAILSSERVER_PORT', value: '3000' }
            // Puma läuft ohne nginx davor — statische Assets (JS/CSS) direkt via Rack ausliefern
            { name: 'RAILS_SERVE_STATIC_FILES', value: 'true' }
          ])
          resources: { cpu: json('1.0'), memory: '2Gi' }
          probes: [
            {
              type: 'Startup'
              tcpSocket: { port: 3000 }
              initialDelaySeconds: 60
              periodSeconds: 10
              failureThreshold: 120
            }
          ]
        }
        {
          name: 'zammad-scheduler'
          image: zammadImage
          command: ['/bin/bash', '-c']
          args: ['until (echo >/dev/tcp/localhost/3000) 2>/dev/null; do sleep 5; done && exec /docker-entrypoint.sh zammad-scheduler']
          env: zammadEnv
          resources: { cpu: json('0.5'), memory: '1Gi' }
        }
        {
          name: 'zammad-websocket'
          image: zammadImage
          command: ['/bin/bash', '-c']
          args: ['until (echo >/dev/tcp/localhost/3000) 2>/dev/null; do sleep 5; done && exec /docker-entrypoint.sh zammad-websocket']
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
