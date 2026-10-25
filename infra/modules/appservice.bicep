@description('Azure region for the App Service resources')
param location string = resourceGroup().location

@description('Project prefix used for naming resources')
param projectPrefix string = 'drs'

@description('Resource ID of the delegated App Service subnet (snet-app) from Step 1')
param appSubnetId string

@description('Name of the Key Vault from Step 3 (used to scope the RBAC role assignment)')
param keyVaultName string

@description('Key Vault Secret URI for DATABASE_URL')
param databaseUrlSecretUri string

@description('Key Vault Secret URI for JWT_SECRET')
param jwtSecretUri string

@description('App Service Plan SKU (B1 is the cheapest tier that supports VNet Integration)')
@allowed([
  'F1'
  'B1'
])
param appServicePlanSku string = 'B1'

var appServicePlanName = 'asp-${projectPrefix}-${uniqueString(resourceGroup().id)}'
var webAppName = 'app-${projectPrefix}-${uniqueString(resourceGroup().id)}'

// Built-in Azure RBAC Role ID for "Key Vault Secrets User" (Read-only access to secrets for App Service Managed Identity)
var keyVaultSecretsUserRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '4633458b-17de-408a-b874-0445c86b69e6'
)

// Reference existing Key Vault to attach the RBAC Role Assignment
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// 1. Linux App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  sku: {
    name: appServicePlanSku
    tier: appServicePlanSku == 'F1' ? 'Free' : 'Basic'
  }
  properties: {
    reserved: true // Required for Linux App Service Plans
  }
}

// 2. Azure App Service (Native Node.js 20 LTS + System-Assigned Managed Identity + VNet Integration)
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    virtualNetworkSubnetId: appSubnetId
    vnetRouteAllEnabled: true // Routes outbound traffic through snet-app and nsg-drs-app
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: appServicePlanSku != 'F1'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appCommandLine: 'node server.js'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'DATABASE_URL'
          value: '@Microsoft.KeyVault(SecretUri=${databaseUrlSecretUri})'
        }
        {
          name: 'JWT_SECRET'
          value: '@Microsoft.KeyVault(SecretUri=${jwtSecretUri})'
        }
      ]
    }
  }
}

// 3. RBAC Role Assignment: Grant the App Service Managed Identity "Key Vault Secrets User" on the Key Vault
resource webAppKeyVaultRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, webApp.id, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: keyVaultSecretsUserRoleId
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppPrincipalId string = webApp.identity.principalId
