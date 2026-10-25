# Disaster Relief Coordination System

## Overview

This project is a full-stack Disaster Relief Coordination System built with Next.js 14, TypeScript, Prisma ORM, and MySQL, with cloud infrastructure defined in Azure Bicep and automated via GitHub Actions. It coordinates citizen aid requests, citizen donations, volunteer rescue vehicles, and a central warehouse base following a natural disaster.

### Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Full-stack TypeScript, React 18, Standalone Output)
- **Database & ORM**: MySQL 8.0 + [Prisma ORM](https://www.prisma.io/)
- **Styling & Icons**: Tailwind CSS + Lucide Icons
- **Maps & Geolocation**: [Leaflet](https://leafletjs.com/) + Haversine geodesic distance validation
- **Analytics**: [Chart.js](https://www.chartjs.org/) (`react-chartjs-2`)
- **Authentication**: Stateless HTTP-only JWT session cookies (`jose`) + Next.js Edge Middleware RBAC
- **Cloud Infrastructure & CI/CD**: Azure Bicep (`centralus`), Azure App Service (Linux Node 22 LTS), Azure Database for MySQL Flexible Server (MySQL 8.4), Azure Key Vault (RBAC), Virtual Network Isolation, and GitHub Actions

---

## Project Layout

```text
.
├── .github/
│   └── workflows/
│       └── deploy-azure.yml        # CI/CD pipeline: Bicep provisioning & Next.js deployment
├── infra/
│   ├── main.bicep                  # Root Bicep orchestration template (Resource Group scope)
│   ├── main.bicepparam             # Bicep parameters reading secrets from CI environment variables
│   └── modules/
│       ├── network.bicep           # VNet (10.0.0.0/16), Subnets (snet-app, snet-db), NSGs, Private DNS
│       ├── mysql.bicep             # Private Azure Database for MySQL Flexible Server (Standard_B1s)
│       ├── keyvault.bicep          # RBAC-enabled Azure Key Vault storing DATABASE-URL & JWT-SECRET
│       └── appservice.bicep        # Linux App Service Plan (B1), Web App, VNet Integration & RBAC
├── prisma/
│   ├── schema.prisma               # MySQL database schema (12 models)
│   └── seed.ts                     # Database seed script for initial accounts, base, and inventory
├── public/
│   ├── data.json                   # Product & category catalogue synced with admin operations
│   └── *.png                       # Custom map marker icons (base, vehicles, requests, donations)
├── src/
│   ├── app/
│   │   ├── admin/page.tsx          # Base Administrator dashboard
│   │   ├── volunteer/page.tsx      # Volunteer Rescuer dashboard
│   │   ├── citizen/page.tsx        # Citizen dashboard
│   │   ├── login/page.tsx          # Authentication & Citizen registration page with map picker
│   │   ├── unauthorized/page.tsx   # Custom 401 Unauthorized error page
│   │   ├── not-found.tsx           # Custom 404 Not Found error page
│   │   └── api/                    # REST API routes (auth, admin, volunteer, citizen)
│   ├── components/
│   │   ├── AdminMap.tsx            # Interactive Leaflet map for Base Administrators
│   │   └── VolunteerMap.tsx        # Interactive Leaflet map for Volunteers
│   ├── lib/
│   │   ├── auth.ts                 # JWT session signing, verification, and cookie helpers
│   │   ├── db-init.ts              # Automatic idempotent schema & seed initializer for private VNet DB
│   │   ├── geo.ts                  # Haversine distance calculation (100m base / 50m task rules)
│   │   ├── json-sync.ts            # Synchronizes product/category changes with public/data.json
│   │   └── prisma.ts               # Prisma Client singleton
│   └── middleware.ts               # Role-based route & API protection middleware
├── .env.example                    # Template for local environment variables
├── next.config.mjs                 # Next.js configuration (standalone build output)
└── package.json
```

---

## Core Features by Role

### 1. Base Administrator (`/admin`)
- **Base Items & Announcements**:
  - Manage Product Storage Catalogue (add new products, edit product details/stock, import/export `data.json`).
  - Transfer stock from Storage to Base (`Add to Base`), return stock from Base to Storage (`Remove from Available`), or remove damaged stock (`Remove Entirely`).
  - Create new product categories dynamically.
  - Publish and delete shortage announcements for citizens.
- **Map, Inventory Overview & Statistics**:
  - Interactive Leaflet Map displaying the draggable **Base Warehouse**, **Volunteer Vehicles** (with live cargo load), **Accepted/Pending Requests**, **Accepted/Pending Offers**, and **Task Connection Lines**, with toggleable visibility filters.
  - Unified Inventory Status Table across the Base and all Vehicles with category filter checkboxes (`ALL`, `FOOD`, `HYGIENE`, `MEDICAL_SUPPLIES`, `CLOTHING`, etc.).
  - Service Statistics Pie Chart breaking down Completed vs. Incomplete Requests and Donations across selectable time ranges (`Last Day`, `Last Week`, `Last Month`, `Last 6 Months`, `Last Year`, `All Time`).
- **Volunteer Account Management**:
  - Register new Volunteer accounts and automatically provision their rescue vehicle and map coordinates.

### 2. Volunteer Rescuer (`/volunteer`)
- **Interactive Navigation Map**:
  - Drag and drop the rescue vehicle marker to update real-time coordinates (`volunteer` and `vehicle` tables).
  - Click any pending Citizen Request or Offer marker on the map to **Accept Task** (up to **4 active tasks** per vehicle).
  - View polylines connecting the vehicle to accepted tasks.
- **Base Cargo Loading & Unloading**:
  - Enforces the **100 m Haversine distance rule** from the Base Warehouse before allowing cargo loading or unloading.
- **Active Tasks Panel**:
  - View assigned Citizen details, phone number, product, quantity, and live distance in meters.
  - **Complete** tasks when within **50 m** of the citizen (automatically deducting requested items from vehicle cargo or adding donated items to vehicle cargo) or **Cancel** tasks to return them to the pending pool.

### 3. Citizen (`/citizen`)
- **Requesting a Product**:
  - Browse products by category or use the interactive autocomplete search box to request supplies for family members.
- **Request History**:
  - Track submission, volunteer acceptance, and completion timestamps for all submitted requests.
- **Base Announcements & Donations**:
  - View active Base shortage announcements, pledge donations, and manage or cancel pending donations in **Donation History**.

---

## Local Development Setup

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and update the connection string for your local MySQL server:

```env
DATABASE_URL="mysql://<DB_USER>:<DB_PASSWORD>@localhost:3306/disaster_supply_database"
JWT_SECRET="<YOUR_RANDOM_32_BYTE_HEX_SECRET>"
```

### 2. Install Dependencies & Seed the Database
```bash
npm install
npm run db:push
npm run db:seed
```

### 3. Start the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Cloud Deployment (Azure Bicep + GitHub Actions)

Pushing to the `main` branch triggers [`.github/workflows/deploy-azure.yml`](./.github/workflows/deploy-azure.yml), which provisions all infrastructure in `centralus` (`rg-disaster-relief`) via [`infra/main.bicep`](./infra/main.bicep) and deploys the Next.js standalone build:

1. **Network Isolation (`infra/modules/network.bicep`)**:
   - Provisions `vnet-drs` (`10.0.0.0/16`) with delegated subnets `snet-app` (`10.0.1.0/24`) and `snet-db` (`10.0.2.0/24`), Network Security Groups (`nsg-drs-app`, `nsg-drs-db`) restricting inbound port `3306` exclusively to `snet-app`, and a Private DNS Zone (`privatelink.mysql.database.azure.com`).
2. **Database (`infra/modules/mysql.bicep`)**:
   - Provisions an Azure Database for MySQL Flexible Server (`Standard_B1s`, MySQL `8.4`) inside `snet-db` with public network access disabled and creates `disaster_supply_database`.
3. **Secret Management (`infra/modules/keyvault.bicep`)**:
   - Provisions an RBAC-enabled Azure Key Vault and stores `DATABASE-URL` (constructed automatically from the provisioned MySQL FQDN) and `JWT-SECRET`.
4. **Compute & Managed Identity (`infra/modules/appservice.bicep`)**:
   - Provisions a Linux App Service Plan (`B1`) and Web App (`NODE|22-lts`) with a System-Assigned Managed Identity granted the `Key Vault Secrets User` RBAC role, referencing both secrets via `@Microsoft.KeyVault(SecretUri=...)`.

### Required GitHub Repository Secrets
| Secret Name | Purpose |
|-------------|---------|
| `AZURE_CREDENTIALS` | Azure Service Principal JSON credentials for `azure/login@v2` |
| `DB_ADMIN_PASSWORD` | Administrator password for the Azure MySQL Flexible Server |
| `JWT_SECRET` | 256-bit secret key pushed to Azure Key Vault for signing JWT cookies |

---

## Default Seed Accounts

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `nikosvoulg` | `thedarkknight` |
| **Volunteer** | `markkennei` | `hgfnf6543` |
| **Volunteer** | `ginorton` | `gffg5tr` |
| **Citizen** | `emmo` | `ytrfgbgf` |
| **Citizen** | `georgerin` | `65433rthgr` |
