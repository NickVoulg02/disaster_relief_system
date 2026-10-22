# Disaster Relief Coordination System (Next.js + TypeScript + Prisma)

## 📌 Overview

This project is a **modern full-stack rework** of the collaborative Disaster Relief Coordination System (originally built with PHP, vanilla JS, HTML/CSS, and MySQL). It coordinates **citizen aid requests**, **citizen donations**, **volunteer rescue vehicles**, and a **central warehouse base** following a natural disaster.

### ✨ Modernized Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Full-stack TypeScript, React 18)
- **Database & ORM**: MySQL / MariaDB + [Prisma ORM](https://www.prisma.io/)
- **Styling & Icons**: Tailwind CSS + Lucide Icons
- **Maps & Geolocation**: [Leaflet](https://leafletjs.com/) + Haversine geodesic distance validation
- **Analytics**: [Chart.js](https://www.chartjs.org/) (`react-chartjs-2`)
- **Authentication**: Stateless HTTP-only JWT session cookies (`jose`)

---

## 🛠️ Core Features by Role

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
  - Drag and drop your rescue vehicle marker to update your real-time coordinates (`volunteer` and `vehicle` tables).
  - Click any pending Citizen Request or Offer marker on the map to **Accept Task** (up to **4 active tasks** per vehicle).
  - View red polylines connecting your vehicle to your accepted tasks.
- **Base Cargo Loading & Unloading**:
  - Enforces the **$\le 100\text{ m}$ Haversine distance rule** from the Base Warehouse before allowing cargo loading or unloading.
- **Active Tasks Panel**:
  - View assigned Citizen details, phone number, product, quantity, and live distance in meters.
  - **Complete** tasks when within **$\le 50\text{ m}$** of the citizen (automatically deducting requested items from vehicle cargo or adding donated items to vehicle cargo) or **Cancel** tasks to return them to the pending pool.

### 3. Citizen (`/citizen`)
- **Requesting a Product**:
  - Browse products by category or use the interactive autocomplete search box to request supplies for your family members.
- **Request History**:
  - Track submission, volunteer acceptance, and completion timestamps for all your requests.
- **Base Announcements & Donations**:
  - View active Base shortage announcements, pledge donations, and manage or cancel pending donations in your **Donation History**.

---

## 🚀 Getting Started

### 1. Configure MySQL Connection
Ensure your MySQL / XAMPP server is running (default XAMPP port `3307` or `3306`) and check `.env`:
```env
DATABASE_URL="mysql://root:Thedarkknight1@localhost:3307/disaster_supply_database"
JWT_SECRET="disaster-relief-secret-key-2024-upatras"
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

## 🔑 Default Seed Accounts (from `DATABASE.sql`)

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `nikosvoulg` | `thedarkknight` |
| **Volunteer** | `markkennei` | `hgfnf6543` |
| **Volunteer** | `ginorton` | `gffg5tr` |
| **Citizen** | `emmo` | `ytrfgbgf` |
| **Citizen** | `georgerin` | `65433rthgr` |

> Legacy PHP, SQL, and documentation files are preserved in the [`legacy/`](./legacy) directory for reference.
