using './main.bicep'

param location = 'centralus'
param projectPrefix = 'drs'
param dbAdminLogin = 'drsadmin'

// Reads secrets directly from environment variables in GitHub Actions
param dbAdminPassword = readEnvironmentVariable('DB_ADMIN_PASSWORD', '')
param databaseUrl = readEnvironmentVariable('DATABASE_URL', '')
param jwtSecret = readEnvironmentVariable('JWT_SECRET', '')
param adminPrincipalId = readEnvironmentVariable('ADMIN_PRINCIPAL_ID', '')
