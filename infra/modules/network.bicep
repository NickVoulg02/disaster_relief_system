@description('Azure region for all networking resources')
param location string = resourceGroup().location

@description('Prefix for resource names')
param projectPrefix string = 'drs'

var vnetName = 'vnet-${projectPrefix}'
var appSubnetName = 'snet-app'
var dbSubnetName = 'snet-db'
var nsgAppName = 'nsg-${projectPrefix}-app'
var nsgDbName = 'nsg-${projectPrefix}-db'
var privateDnsZoneName = 'privatelink.mysql.database.azure.com'

// Network Security Group for the App Service Subnet
resource nsgApp 'Microsoft.Network/networkSecurityGroups@2023-11-01' = {
  name: nsgAppName
  location: location
  properties: {
    securityRules: [
      {
        name: 'Allow-HTTPS-Inbound'
        properties: {
          description: 'Allow public HTTPS traffic to the web tier'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '443'
          sourceAddressPrefix: 'Internet'
          destinationAddressPrefix: '10.0.1.0/24'
          access: 'Allow'
          priority: 100
          direction: 'Inbound'
        }
      }
      {
        name: 'Allow-HTTP-Inbound'
        properties: {
          description: 'Allow HTTP traffic for redirect to HTTPS'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '80'
          sourceAddressPrefix: 'Internet'
          destinationAddressPrefix: '10.0.1.0/24'
          access: 'Allow'
          priority: 110
          direction: 'Inbound'
        }
      }
      {
        name: 'Allow-MySQL-Outbound-To-DbSubnet'
        properties: {
          description: 'Allow outbound MySQL (3306) from App Subnet to DB Subnet'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '3306'
          sourceAddressPrefix: '10.0.1.0/24'
          destinationAddressPrefix: '10.0.2.0/24'
          access: 'Allow'
          priority: 100
          direction: 'Outbound'
        }
      }
      {
        name: 'Allow-KeyVault-Outbound'
        properties: {
          description: 'Allow outbound HTTPS (443) from App Subnet to Azure Key Vault service tag'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '443'
          sourceAddressPrefix: '10.0.1.0/24'
          destinationAddressPrefix: 'AzureKeyVault'
          access: 'Allow'
          priority: 110
          direction: 'Outbound'
        }
      }
    ]
  }
}

// Network Security Group for the MySQL Database Subnet 
resource nsgDb 'Microsoft.Network/networkSecurityGroups@2023-11-01' = {
  name: nsgDbName
  location: location
  properties: {
    securityRules: [
      {
        name: 'Allow-MySQL-From-AppSubnet-Only'
        properties: {
          description: 'Allow inbound MySQL (3306) exclusively from snet-app (10.0.1.0/24)'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '3306'
          sourceAddressPrefix: '10.0.1.0/24'
          destinationAddressPrefix: '10.0.2.0/24'
          access: 'Allow'
          priority: 100
          direction: 'Inbound'
        }
      }
      {
        name: 'Deny-Internet-Inbound-To-Db'
        properties: {
          description: 'Explicitly block any direct Internet traffic to the Database subnet'
          protocol: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
          sourceAddressPrefix: 'Internet'
          destinationAddressPrefix: '10.0.2.0/24'
          access: 'Deny'
          priority: 4000
          direction: 'Inbound'
        }
      }
      {
        name: 'Allow-AzureStorage-Outbound'
        properties: {
          description: 'Required by Azure Database for MySQL Flexible Server for automated backups'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '443'
          sourceAddressPrefix: '10.0.2.0/24'
          destinationAddressPrefix: 'Storage'
          access: 'Allow'
          priority: 100
          direction: 'Outbound'
        }
      }
    ]
  }
}

// Virtual Network (10.0.0.0/16) with delegated App and DB Subnets
resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: appSubnetName
        properties: {
          addressPrefix: '10.0.1.0/24'
          networkSecurityGroup: {
            id: nsgApp.id
          }
          delegations: [
            {
              name: 'appServiceDelegation'
              properties: {
                serviceName: 'Microsoft.Web/serverFarms'
              }
            }
          ]
        }
      }
      {
        name: dbSubnetName
        properties: {
          addressPrefix: '10.0.2.0/24'
          networkSecurityGroup: {
            id: nsgDb.id
          }
          delegations: [
            {
              name: 'mysqlFlexibleServerDelegation'
              properties: {
                serviceName: 'Microsoft.DBforMySQL/flexibleServers'
              }
            }
          ]
        }
      }
    ]
  }
}

// Private DNS Zone for MySQL Flexible Server VNet resolution
resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: privateDnsZoneName
  location: 'global'
}

resource privateDnsVnetLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsZone
  name: '${vnetName}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnet.id
    }
  }
}

output vnetId string = vnet.id
output appSubnetId string = vnet.properties.subnets[0].id
output dbSubnetId string = vnet.properties.subnets[1].id
output privateDnsZoneId string = privateDnsZone.id

