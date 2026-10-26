@description('Azure region for the Key Vault')
param location string = resourceGroup().location

@description('Project prefix used for naming resources')
param projectPrefix string = 'drs'

@secure()
@description('Full Prisma DATABASE_URL connection string to store in Key Vault')
param databaseUrl string

@secure()
@description('JWT_SECRET key to store in Key Vault')
param jwtSecret string

@description('Optional Azure AD Object ID (principalId) of the user/admin to grant Key Vault Secrets Officer role')
param adminPrincipalId string = ''

// Key Vault name
var keyVaultName = take('kv-${projectPrefix}-${uniqueString(resourceGroup().id)}', 24)

// Built-in Azure RBAC Role Definition IDs for Key Vault
// Key Vault Secrets Officer:Read/Write/Delete secrets 
var keyVaultSecretsOfficerRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  'b86a8fe4-44ce-4948-aee5-eccb2c155cd7'
)

// Azure Key Vault with RBAC Authorization enabled
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
  }
}

// Store DATABASE_URL Secret in Key Vault
resource databaseUrlSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'DATABASE-URL'
  properties: {
    value: databaseUrl
  }
}

// Store JWT_SECRET in Key Vault
resource jwtSecretResource 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'JWT-SECRET'
  properties: {
    value: jwtSecret
  }
}

// Grant the deploying User "Key Vault Secrets Officer"
resource adminSecretsOfficerRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(adminPrincipalId)) {
  name: guid(keyVault.id, adminPrincipalId, keyVaultSecretsOfficerRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: keyVaultSecretsOfficerRoleId
    principalId: adminPrincipalId
    principalType: 'User'
  }
}

output keyVaultName string = keyVault.name
output databaseUrlSecretUri string = databaseUrlSecret.properties.secretUriWithVersion
output jwtSecretUri string = jwtSecretResource.properties.secretUriWithVersion

