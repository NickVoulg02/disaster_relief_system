import { prisma } from '@/lib/prisma';
import { UserType, DemandType, TaskStatus } from '@prisma/client';

let isInitialized = false;

/**
 * Ensures the MySQL database tables exist and are seeded when running inside
 * the private Azure VNet (where external runners cannot directly reach MySQL).
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  if (isInitialized) return;

  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      isInitialized = true;
      return;
    }
  } catch {
    // Tables do not exist yet in disaster_supply_database; create them below
    const ddlStatements = [
      `CREATE TABLE IF NOT EXISTS \`users\` (
        \`user_id\` INT NOT NULL AUTO_INCREMENT,
        \`user_name\` VARCHAR(50) NOT NULL,
        \`user_pass\` VARCHAR(100) NOT NULL,
        \`user_type\` ENUM('citizen', 'volunteer', 'admin') NOT NULL,
        PRIMARY KEY (\`user_id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`citizen\` (
        \`cit_id\` INT NOT NULL,
        \`cit_name\` VARCHAR(50) NOT NULL,
        \`cit_laname\` VARCHAR(50) NOT NULL,
        \`cit_long\` FLOAT NOT NULL,
        \`cit_lat\` FLOAT NOT NULL,
        \`cit_number\` VARCHAR(30) NOT NULL,
        PRIMARY KEY (\`cit_id\`),
        CONSTRAINT \`citizen_cit_id_fkey\` FOREIGN KEY (\`cit_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`volunteer\` (
        \`vol_id\` INT NOT NULL,
        \`vol_name\` VARCHAR(50) NOT NULL,
        \`vol_lname\` VARCHAR(50) NOT NULL,
        \`vol_long\` FLOAT NOT NULL,
        \`vol_lat\` FLOAT NOT NULL,
        \`vol_num\` VARCHAR(30) NOT NULL,
        PRIMARY KEY (\`vol_id\`),
        CONSTRAINT \`volunteer_vol_id_fkey\` FOREIGN KEY (\`vol_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`categories\` (
        \`cat_id\` INT NOT NULL AUTO_INCREMENT,
        \`cat_name\` VARCHAR(50) NOT NULL,
        PRIMARY KEY (\`cat_id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`base\` (
        \`id\` INT NOT NULL,
        \`longtitude\` FLOAT NOT NULL,
        \`latitude\` FLOAT NOT NULL,
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`product\` (
        \`pr_id\` INT NOT NULL AUTO_INCREMENT,
        \`pr_name\` VARCHAR(50) NOT NULL,
        \`pr_cat_id\` INT NOT NULL,
        \`detail_name\` VARCHAR(50) NULL,
        \`detail_value\` INT NULL,
        PRIMARY KEY (\`pr_id\`),
        CONSTRAINT \`product_pr_cat_id_fkey\` FOREIGN KEY (\`pr_cat_id\`) REFERENCES \`categories\`(\`cat_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`base_load\` (
        \`asdaa\` INT NOT NULL AUTO_INCREMENT,
        \`base_id\` INT NULL DEFAULT 1,
        \`pr_id\` INT NULL,
        \`pr_quantity\` INT NULL,
        PRIMARY KEY (\`asdaa\`),
        CONSTRAINT \`base_load_base_id_fkey\` FOREIGN KEY (\`base_id\`) REFERENCES \`base\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`base_load_pr_id_fkey\` FOREIGN KEY (\`pr_id\`) REFERENCES \`product\`(\`pr_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`demands\` (
        \`dem_id\` INT NOT NULL AUTO_INCREMENT,
        \`dem_cit_id\` INT NOT NULL,
        \`dem_pr_id\` INT NOT NULL,
        \`dem_value\` INT NULL,
        \`dem_type\` ENUM('request', 'donation') NOT NULL,
        PRIMARY KEY (\`dem_id\`),
        CONSTRAINT \`demands_dem_cit_id_fkey\` FOREIGN KEY (\`dem_cit_id\`) REFERENCES \`citizen\`(\`cit_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`demands_dem_pr_id_fkey\` FOREIGN KEY (\`dem_pr_id\`) REFERENCES \`product\`(\`pr_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`task\` (
        \`task_id\` INT NOT NULL AUTO_INCREMENT,
        \`task_dem_id\` INT NOT NULL,
        \`task_submission_date\` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
        \`task_acceptance_date\` DATETIME(0) NULL,
        \`task_completion_date\` DATETIME(0) NULL,
        \`task_status\` ENUM('Complete', 'Not Complete') NOT NULL DEFAULT 'Not Complete',
        PRIMARY KEY (\`task_id\`),
        CONSTRAINT \`task_task_dem_id_fkey\` FOREIGN KEY (\`task_dem_id\`) REFERENCES \`demands\`(\`dem_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`accepts\` (
        \`acc_vol_id\` INT NOT NULL,
        \`acc_task_id\` INT NOT NULL,
        PRIMARY KEY (\`acc_vol_id\`, \`acc_task_id\`),
        CONSTRAINT \`accepts_acc_vol_id_fkey\` FOREIGN KEY (\`acc_vol_id\`) REFERENCES \`volunteer\`(\`vol_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`accepts_acc_task_id_fkey\` FOREIGN KEY (\`acc_task_id\`) REFERENCES \`task\`(\`task_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`vehicle\` (
        \`veh_id\` INT NOT NULL AUTO_INCREMENT,
        \`veh_vol_id\` INT NOT NULL,
        \`veh_task_num\` INT NOT NULL DEFAULT 0,
        \`longtitude\` FLOAT NOT NULL,
        \`latitude\` FLOAT NOT NULL,
        PRIMARY KEY (\`veh_id\`),
        CONSTRAINT \`vehicle_veh_vol_id_fkey\` FOREIGN KEY (\`veh_vol_id\`) REFERENCES \`volunteer\`(\`vol_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`veh_load\` (
        \`veh_load_id\` INT NOT NULL,
        \`veh_load_prod\` INT NOT NULL,
        \`pr_quantity\` INT NOT NULL,
        PRIMARY KEY (\`veh_load_id\`, \`veh_load_prod\`),
        CONSTRAINT \`veh_load_veh_load_id_fkey\` FOREIGN KEY (\`veh_load_id\`) REFERENCES \`vehicle\`(\`veh_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`veh_load_veh_load_prod_fkey\` FOREIGN KEY (\`veh_load_prod\`) REFERENCES \`product\`(\`pr_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`announcements\` (
        \`ann_id\` INT NOT NULL AUTO_INCREMENT,
        \`ann_pr_id\` INT NOT NULL,
        \`ann_value\` INT NULL,
        PRIMARY KEY (\`ann_id\`),
        CONSTRAINT \`announcements_ann_pr_id_fkey\` FOREIGN KEY (\`ann_pr_id\`) REFERENCES \`product\`(\`pr_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    ];

    for (const stmt of ddlStatements) {
      await prisma.$executeRawUnsafe(stmt);
    }
  }

  // Seed initial dataset if database is empty
  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    const usersData: { user_id: number; user_name: string; user_pass: string; user_type: UserType }[] = [
      { user_id: 1, user_name: 'emmo', user_pass: 'ytrfgbgf', user_type: 'citizen' },
      { user_id: 2, user_name: 'ginorton', user_pass: 'gffg5tr', user_type: 'volunteer' },
      { user_id: 3, user_name: 'markkennei', user_pass: 'hgfnf6543', user_type: 'volunteer' },
      { user_id: 4, user_name: 'louipetr', user_pass: 'ghfefgb43', user_type: 'volunteer' },
      { user_id: 5, user_name: 'sergkrist', user_pass: '4532432', user_type: 'citizen' },
      { user_id: 6, user_name: 'georgerin', user_pass: '65433rthgr', user_type: 'citizen' },
      { user_id: 7, user_name: 'jonburg', user_pass: 'nbbgf5', user_type: 'citizen' },
      { user_id: 8, user_name: 'nikosvoulg', user_pass: 'thedarkknight', user_type: 'admin' },
      { user_id: 9, user_name: 'aggelos', user_pass: 'hggfrs', user_type: 'citizen' },
    ];
    await prisma.user.createMany({ data: usersData });

    await prisma.volunteer.createMany({
      data: [
        { vol_id: 2, vol_name: 'Gina', vol_lname: 'Norton', vol_long: 21.7350, vol_lat: 38.2420, vol_num: '7564565' },
        { vol_id: 3, vol_name: 'Marc', vol_lname: 'Kein', vol_long: 21.7322, vol_lat: 38.2462, vol_num: '654357' },
        { vol_id: 4, vol_name: 'Louise', vol_lname: 'Peterson', vol_long: 21.7389, vol_lat: 38.2485, vol_num: '6543565' },
      ],
    });

    await prisma.citizen.createMany({
      data: [
        { cit_id: 1, cit_name: 'Emmanuel', cit_laname: 'Moratti', cit_long: 21.7349, cit_lat: 38.2444, cit_number: '546544654' },
        { cit_id: 5, cit_name: 'Sergei', cit_laname: 'Kristov', cit_long: 21.7330, cit_lat: 38.2410, cit_number: '4532432' },
        { cit_id: 6, cit_name: 'George', cit_laname: 'Erin', cit_long: 21.7320, cit_lat: 38.2450, cit_number: '7655677' },
        { cit_id: 7, cit_name: 'Jonas', cit_laname: 'Burgmann', cit_long: 21.7325, cit_lat: 38.2430, cit_number: '7654352' },
        { cit_id: 9, cit_name: 'Aggelos', cit_laname: 'Voulgaris', cit_long: 21.7369, cit_lat: 38.2469, cit_number: '6971662770' },
      ],
    });

    await prisma.category.createMany({
      data: [
        { cat_id: 1, cat_name: 'FOOD' },
        { cat_id: 2, cat_name: 'HYGIENE' },
        { cat_id: 3, cat_name: 'MEDICAL_SUPPLIES' },
        { cat_id: 4, cat_name: 'CLOTHING' },
      ],
    });

    await prisma.product.createMany({
      data: [
        { pr_id: 1, pr_name: 'Water', pr_cat_id: 1, detail_name: 'Bottles', detail_value: 20 },
        { pr_id: 2, pr_name: 'Milk', pr_cat_id: 1, detail_name: 'Bottles', detail_value: 15 },
        { pr_id: 3, pr_name: 'Winter Gloves', pr_cat_id: 4, detail_name: 'Pair', detail_value: 10 },
        { pr_id: 4, pr_name: 'Winter Socks', pr_cat_id: 4, detail_name: 'Pair', detail_value: 12 },
        { pr_id: 5, pr_name: 'Hand Sanitizer', pr_cat_id: 2, detail_name: 'Bottle', detail_value: 15 },
        { pr_id: 6, pr_name: 'Hand Wipes', pr_cat_id: 2, detail_name: 'Pack', detail_value: 15 },
        { pr_id: 7, pr_name: 'Pasta', pr_cat_id: 1, detail_name: 'Pack', detail_value: 20 },
        { pr_id: 8, pr_name: 'Toothbrush', pr_cat_id: 2, detail_name: 'Pack', detail_value: 10 },
        { pr_id: 9, pr_name: 'Depon', pr_cat_id: 3, detail_name: 'Pack', detail_value: 15 },
        { pr_id: 10, pr_name: 'Toothpaste', pr_cat_id: 2, detail_name: 'Tube', detail_value: 10 },
      ],
    });

    await prisma.base.create({
      data: { id: 1, longtitude: 21.7351, latitude: 38.2462 },
    });

    await prisma.baseLoad.createMany({
      data: [
        { base_id: 1, pr_id: 1, pr_quantity: 10 },
        { base_id: 1, pr_id: 2, pr_quantity: 8 },
        { base_id: 1, pr_id: 7, pr_quantity: 6 },
        { base_id: 1, pr_id: 9, pr_quantity: 5 },
      ],
    });

    const demandsData: { dem_id: number; dem_cit_id: number; dem_pr_id: number; dem_value: number; dem_type: DemandType }[] = [
      { dem_id: 1, dem_cit_id: 1, dem_pr_id: 1, dem_value: 5, dem_type: 'request' },
      { dem_id: 2, dem_cit_id: 1, dem_pr_id: 2, dem_value: 3, dem_type: 'request' },
      { dem_id: 3, dem_cit_id: 6, dem_pr_id: 7, dem_value: 2, dem_type: 'request' },
      { dem_id: 4, dem_cit_id: 9, dem_pr_id: 9, dem_value: 2, dem_type: 'request' },
      { dem_id: 5, dem_cit_id: 5, dem_pr_id: 2, dem_value: 3, dem_type: 'donation' },
      { dem_id: 6, dem_cit_id: 5, dem_pr_id: 7, dem_value: 2, dem_type: 'donation' },
      { dem_id: 7, dem_cit_id: 7, dem_pr_id: 9, dem_value: 3, dem_type: 'donation' },
    ];
    await prisma.demand.createMany({ data: demandsData });

    const now = new Date();
    await prisma.task.createMany({
      data: [
        { task_id: 1, task_dem_id: 1, task_submission_date: new Date(now.getTime() - 2 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
        { task_id: 2, task_dem_id: 2, task_submission_date: new Date(now.getTime() - 5 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
        { task_id: 3, task_dem_id: 3, task_submission_date: new Date(now.getTime() - 24 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
        { task_id: 4, task_dem_id: 4, task_submission_date: now, task_status: TaskStatus.Not_Complete },
        { task_id: 5, task_dem_id: 5, task_submission_date: new Date(now.getTime() - 12 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
        { task_id: 6, task_dem_id: 6, task_submission_date: new Date(now.getTime() - 48 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
        { task_id: 7, task_dem_id: 7, task_submission_date: now, task_status: TaskStatus.Not_Complete },
      ],
    });

    await prisma.vehicle.createMany({
      data: [
        { veh_id: 1, veh_vol_id: 2, veh_task_num: 0, longtitude: 21.7398, latitude: 38.2420 },
        { veh_id: 2, veh_vol_id: 3, veh_task_num: 0, longtitude: 21.7322, latitude: 38.2462 },
        { veh_id: 3, veh_vol_id: 4, veh_task_num: 0, longtitude: 21.7389, latitude: 38.2485 },
      ],
    });

    await prisma.announcement.createMany({
      data: [
        { ann_id: 1, ann_pr_id: 1, ann_value: 5 },
        { ann_id: 2, ann_pr_id: 2, ann_value: 3 },
        { ann_id: 3, ann_pr_id: 7, ann_value: 2 },
        { ann_id: 4, ann_pr_id: 9, ann_value: 2 },
      ],
    });
  }

  isInitialized = true;
}

