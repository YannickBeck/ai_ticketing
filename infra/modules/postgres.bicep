// ============================================================
// Azure Database for PostgreSQL Flexible Server
// Datenbanken: n8n | zammad | ai_buddy (mit pgvector)
// ============================================================

param location string
param env string

@description('PostgreSQL admin login')
param adminLogin string

@secure()
@description('PostgreSQL admin password')
param adminPassword string

@secure()
@description('Password for n8n service account')
param pgN8nPassword string

@secure()
@description('Password for Zammad service account')
param pgZammadPassword string

resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: 'pg-ai-ticketing-${env}'
  location: location
  sku: {
    name: 'Standard_B2s'    // 2 vCores, 4GB RAM — für MVP ausreichend
    tier: 'Burstable'
  }
  properties: {
    version: '15'
    administratorLogin: adminLogin
    administratorLoginPassword: adminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'       // MVP: kein HA — nach Pilot aktivieren
    }
    network: {
      delegatedSubnetResourceId: null
      privateDnsZoneArmResourceId: null
    }
  }
}

// pgvector Extension erlauben
resource pgVectorExtension 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2022-12-01' = {
  name: 'azure.extensions'
  parent: pgServer
  properties: {
    value: 'VECTOR'
    source: 'user-override'
  }
}

// Firewall: Azure-Services erlauben (Container Apps → PostgreSQL)
resource allowAzureServices 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  name: 'AllowAzureServices'
  parent: pgServer
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Datenbank: n8n
resource dbN8n 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  name: 'n8n'
  parent: pgServer
  properties: {
    charset: 'utf8'
    collation: 'en_US.utf8'
  }
}

// Datenbank: zammad
resource dbZammad 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  name: 'zammad'
  parent: pgServer
  properties: {
    charset: 'utf8'
    collation: 'en_US.utf8'
  }
}

// Datenbank: ai_buddy (AI-Metadaten + pgvector)
resource dbAiBuddy 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  name: 'ai_buddy'
  parent: pgServer
  properties: {
    charset: 'utf8'
    collation: 'en_US.utf8'
  }
}

output pgHost string = pgServer.properties.fullyQualifiedDomainName
output pgServerId string = pgServer.id

// ─── Deployment Script: Erstellt dedizierte DB-User ───────────
// Separate Identity mit Contributor-Rolle, damit das Script seine
// Outputs in den automatisch erzeugten Storage Account schreiben kann.

resource scriptIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-deploy-script-${env}'
  location: location
}

resource scriptContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(scriptIdentity.id, 'Contributor', resourceGroup().id)
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c') // Contributor
    principalId: scriptIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource createDbUsers 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'create-db-users-${env}'
  location: location
  kind: 'AzureCLI'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${scriptIdentity.id}': {}
    }
  }
  properties: {
    azCliVersion: '2.52.0'
    retentionInterval: 'P1D'
    cleanupPreference: 'OnSuccess'
    forceUpdateTag: 'v1'
    environmentVariables: [
      { name: 'PG_HOST', value: pgServer.properties.fullyQualifiedDomainName }
      { name: 'PG_ADMIN_USER', value: adminLogin }
      { name: 'PG_ADMIN_PASSWORD', secureValue: adminPassword }
      { name: 'PG_N8N_PASSWORD', secureValue: pgN8nPassword }
      { name: 'PG_ZAMMAD_PASSWORD', secureValue: pgZammadPassword }
    ]
    scriptContent: '''
      #!/bin/bash
      set -e
      apk add --no-cache postgresql-client 2>&1

      run_sql() {
        PGPASSWORD="$PG_ADMIN_PASSWORD" psql -h "$PG_HOST" -U "$PG_ADMIN_USER" -d "$1" -c "$2"
      }

      run_sql postgres "CREATE USER n8n_user WITH PASSWORD '$PG_N8N_PASSWORD';" 2>/dev/null || \
        run_sql postgres "ALTER USER n8n_user WITH PASSWORD '$PG_N8N_PASSWORD';"
      run_sql postgres "GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_user;"
      run_sql n8n     "GRANT ALL ON SCHEMA public TO n8n_user;"

      run_sql postgres "CREATE USER zammad_user WITH PASSWORD '$PG_ZAMMAD_PASSWORD';" 2>/dev/null || \
        run_sql postgres "ALTER USER zammad_user WITH PASSWORD '$PG_ZAMMAD_PASSWORD';"
      run_sql postgres "GRANT ALL PRIVILEGES ON DATABASE zammad TO zammad_user;"
      run_sql zammad  "GRANT ALL ON SCHEMA public TO zammad_user;"

      echo "DB users provisioned"
    '''
  }
  dependsOn: [dbN8n, dbZammad, scriptContributorRole]
}
