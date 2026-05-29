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
