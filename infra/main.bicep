targetScope = 'resourceGroup'

@description('Azure region for all resources (defaults to centralus)')
param location string = 'centralus'

@description('Project prefix used for naming resources')
param projectPrefix string = 'drs'

@description('MySQL administrator username')
param dbAdminLogin string = 'drsadmin'

@secure()
@description('MySQL administrator password')
param dbAdminPassword string

@secure()
@description('DATABASE_URL secret injected from GitHub Secrets into Azure Key Vault. If empty, auto-constructed from the provisioned MySQL server.')
param databaseUrl string = ''

@secure()
@description('JWT_SECRET injected from GitHub Secrets into Azure Key Vault')
param jwtSecret string

@description('Optional Azure AD Object ID (principalId) of your user/service principal to grant Key Vault Secrets Officer')
param adminPrincipalId string = ''

// Step 1: Deploy Virtual Network, Subnets (snet-app, snet-db), NSGs (nsg-drs-app, nsg-drs-db), and Private DNS Zone
module network './modules/network.bicep' = {
  name: 'step1-network-deployment'
  params: {
    location: location
    projectPrefix: projectPrefix
  }
}

// Step 2: Deploy Azure Database for MySQL Flexible Server (Standard_B1s) inside snet-db
module mysql './modules/mysql.bicep' = {
  name: 'step2-mysql-deployment'
  params: {
    location: location
    projectPrefix: projectPrefix
    dbSubnetId: network.outputs.dbSubnetId
    privateDnsZoneId: network.outputs.privateDnsZoneId
    dbAdminLogin: dbAdminLogin
    dbAdminPassword: dbAdminPassword
  }
}

// Use the DATABASE_URL secret from GitHub Secrets if provided, or auto-construct from Step 2 MySQL outputs
var resolvedDatabaseUrl = !empty(databaseUrl)
  ? databaseUrl
  : 'mysql://${dbAdminLogin}:${uriComponent(dbAdminPassword)}@${mysql.outputs.mysqlFqdn}:3306/${mysql.outputs.databaseName}?sslaccept=strict'

// Step 3: Deploy Azure Key Vault, store DATABASE-URL and JWT-SECRET, and assign RBAC role
module keyVault './modules/keyvault.bicep' = {
  name: 'step3-keyvault-deployment'
  params: {
    location: location
    projectPrefix: projectPrefix
    databaseUrl: resolvedDatabaseUrl
    jwtSecret: jwtSecret
    adminPrincipalId: adminPrincipalId
  }
}

// Step 4: Deploy Azure App Service + Managed Identity + "Key Vault Secrets User" RBAC Role Assignment
module appService './modules/appservice.bicep' = {
  name: 'step4-appservice-deployment'
  params: {
    location: location
    projectPrefix: projectPrefix
    appSubnetId: network.outputs.appSubnetId
    keyVaultName: keyVault.outputs.keyVaultName
    databaseUrlSecretUri: keyVault.outputs.databaseUrlSecretUri
    jwtSecretUri: keyVault.outputs.jwtSecretUri
  }
}

output vnetId string = network.outputs.vnetId
output mysqlFqdn string = mysql.outputs.mysqlFqdn
output keyVaultName string = keyVault.outputs.keyVaultName
output webAppName string = appService.outputs.webAppName
output webAppUrl string = appService.outputs.webAppUrl
