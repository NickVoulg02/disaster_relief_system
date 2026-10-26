@description('Azure region for the App Service resources')
param location string = resourceGroup().location

@description('Project prefix used for naming resources')
param projectPrefix string = 'drs'

@description('Resource ID of the delegated App Service subnet')
param appSubnetId string

@description('Key Vault Name')
param keyVaultName string

@description('Key Vault Secret URI for DATABASE_URL')
param databaseUrlSecretUri string

@description('Key Vault Secret URI for JWT_SECRET')
param jwtSecretUri string

@description('App Service Plan SKU')
@allowed([
  'F1'
  'B1'
])
param appServicePlanSku string = 'B1'

var appServicePlanName = 'asp-${projectPrefix}-${uniqueString(resourceGroup().id)}'
var webAppName = 'app-${projectPrefix}-${uniqueString(resourceGroup().id)}'

// Built-in Azure RBAC Role ID for "Key Vault Secrets User"
var keyVaultSecretsUserRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '4633458b-17de-408a-b874-0445c86b69e6'
)

// Reference existing Key Vault to attach the RBAC Role Assignment
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Linux App Service Plan
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

// Azure App Service
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
      linuxFxVersion: 'NODE|22-lts'
      alwaysOn: appServicePlanSku != 'F1'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appCommandLine: 'node server.js'
    }
  }
}

// Grant the App Service Managed Identity "Key Vault Secrets User" on the Key Vault
resource webAppKeyVaultRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, webApp.id, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: keyVaultSecretsUserRoleId
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// App Settings applied after the Key Vault RBAC role assignment exists 
resource webAppSettings 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: webApp
  name: 'appsettings'
  dependsOn: [
    webAppKeyVaultRoleAssignment
  ]
  properties: {
    NODE_ENV: 'production'
    PORT: '8080'
    WEBSITE_HOSTNAME_DEFAULT: webApp.properties.defaultHostName
    SCM_DO_BUILD_DURING_DEPLOYMENT: 'false'
    DATABASE_URL: '@Microsoft.KeyVault(SecretUri=${databaseUrlSecretUri})'
    JWT_SECRET: '@Microsoft.KeyVault(SecretUri=${jwtSecretUri})'
  }
}

output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppPrincipalId string = webApp.identity.principalId
