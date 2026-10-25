@description('Azure region for the MySQL Flexible Server')
param location string = resourceGroup().location

param projectPrefix string = 'drs'

@description('Resource ID of the database subnet')
param dbSubnetId string

@description('Resource ID of the Private DNS Zone (privatelink.mysql.database.azure.com) from Step 1')
param privateDnsZoneId string

@description('Administrator username for MySQL Flexible Server')
param dbAdminLogin string = 'drsadmin'

@secure()
@description('Administrator password for MySQL Flexible Server')
param dbAdminPassword string

@description('Name of the application database')
param databaseName string = 'disaster_supply_database'

var serverName = 'mysql-${projectPrefix}-${uniqueString(resourceGroup().id)}'

// 1. Azure Database for MySQL - Flexible Server (Private VNet Integrated)
resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-06-30' = {
  name: serverName
  location: location
  sku: {
    name: 'Standard_B1s'
    tier: 'Burstable'
  }
  properties: {
    version: '8.4'
    administratorLogin: dbAdminLogin
    administratorLoginPassword: dbAdminPassword
    storage: {
      storageSizeGB: 20
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    network: {
      delegatedSubnetResourceId: dbSubnetId
      privateDnsZoneResourceId: privateDnsZoneId
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// 2. Application Database (disaster_supply_database)
resource mysqlDatabase 'Microsoft.DBforMySQL/flexibleServers/databases@2023-06-30' = {
  parent: mysqlServer
  name: databaseName
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

output mysqlServerName string = mysqlServer.name
output mysqlFqdn string = mysqlServer.properties.fullyQualifiedDomainName
output databaseName string = mysqlDatabase.name

