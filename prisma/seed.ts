import { PrismaClient, UserType, DemandType, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding disaster_supply_database...');

  // Clear existing data in reverse dependency order
  await prisma.accept.deleteMany();
  await prisma.task.deleteMany();
  await prisma.demand.deleteMany();
  await prisma.vehLoad.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.baseLoad.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.base.deleteMany();
  await prisma.citizen.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
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

  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }

  // 2. Volunteers
  const volunteersData = [
    { vol_id: 2, vol_name: 'Gina', vol_lname: 'Norton', vol_long: 21.7350, vol_lat: 38.2420, vol_num: '7564565' },
    { vol_id: 3, vol_name: 'Marc', vol_lname: 'Kein', vol_long: 21.7322, vol_lat: 38.2462, vol_num: '654357' },
    { vol_id: 4, vol_name: 'Louise', vol_lname: 'Peterson', vol_long: 21.7389, vol_lat: 38.2485, vol_num: '6543565' },
  ];
  for (const v of volunteersData) {
    await prisma.volunteer.create({ data: v });
  }

  // 3. Citizens
  const citizensData = [
    { cit_id: 1, cit_name: 'Emmanuel', cit_laname: 'Moratti', cit_long: 21.7349, cit_lat: 38.2444, cit_number: '546544654' },
    { cit_id: 5, cit_name: 'Sergei', cit_laname: 'Kristov', cit_long: 21.7330, cit_lat: 38.2410, cit_number: '4532432' },
    { cit_id: 6, cit_name: 'George', cit_laname: 'Erin', cit_long: 21.7320, cit_lat: 38.2450, cit_number: '7655677' },
    { cit_id: 7, cit_name: 'Jonas', cit_laname: 'Burgmann', cit_long: 21.7325, cit_lat: 38.2430, cit_number: '7654352' },
    { cit_id: 9, cit_name: 'Aggelos', cit_laname: 'Voulgaris', cit_long: 21.7369, cit_lat: 38.2469, cit_number: '6971662770' },
  ];
  for (const c of citizensData) {
    await prisma.citizen.create({ data: c });
  }

  // 4. Categories
  const categoriesData = [
    { cat_id: 1, cat_name: 'FOOD' },
    { cat_id: 2, cat_name: 'HYGIENE' },
    { cat_id: 3, cat_name: 'MEDICAL_SUPPLIES' },
    { cat_id: 4, cat_name: 'CLOTHING' },
  ];
  for (const cat of categoriesData) {
    await prisma.category.create({ data: cat });
  }

  // 5. Products
  const productsData = [
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
  ];
  for (const p of productsData) {
    await prisma.product.create({ data: p });
  }

  // 6. Base & Base Load
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

  // 7. Demands & Tasks
  const demandsData: { dem_id: number; dem_cit_id: number; dem_pr_id: number; dem_value: number; dem_type: DemandType }[] = [
    { dem_id: 1, dem_cit_id: 1, dem_pr_id: 1, dem_value: 5, dem_type: 'request' },
    { dem_id: 2, dem_cit_id: 1, dem_pr_id: 2, dem_value: 3, dem_type: 'request' },
    { dem_id: 3, dem_cit_id: 6, dem_pr_id: 7, dem_value: 2, dem_type: 'request' },
    { dem_id: 4, dem_cit_id: 9, dem_pr_id: 9, dem_value: 2, dem_type: 'request' },
    { dem_id: 5, dem_cit_id: 5, dem_pr_id: 2, dem_value: 3, dem_type: 'donation' },
    { dem_id: 6, dem_cit_id: 5, dem_pr_id: 7, dem_value: 2, dem_type: 'donation' },
    { dem_id: 7, dem_cit_id: 7, dem_pr_id: 9, dem_value: 3, dem_type: 'donation' },
  ];

  for (const d of demandsData) {
    await prisma.demand.create({ data: d });
  }

  const now = new Date();
  const tasksData = [
    { task_id: 1, task_dem_id: 1, task_submission_date: new Date(now.getTime() - 2 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
    { task_id: 2, task_dem_id: 2, task_submission_date: new Date(now.getTime() - 5 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
    { task_id: 3, task_dem_id: 3, task_submission_date: new Date(now.getTime() - 24 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
    { task_id: 4, task_dem_id: 4, task_submission_date: now, task_status: TaskStatus.Not_Complete },
    { task_id: 5, task_dem_id: 5, task_submission_date: new Date(now.getTime() - 12 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
    { task_id: 6, task_dem_id: 6, task_submission_date: new Date(now.getTime() - 48 * 3600 * 1000), task_status: TaskStatus.Not_Complete },
    { task_id: 7, task_dem_id: 7, task_submission_date: now, task_status: TaskStatus.Not_Complete },
  ];

  for (const t of tasksData) {
    await prisma.task.create({ data: t });
  }

  // 8. Vehicles
  const vehiclesData = [
    { veh_id: 1, veh_vol_id: 2, veh_task_num: 0, longtitude: 21.7398, latitude: 38.2420 },
    { veh_id: 2, veh_vol_id: 3, veh_task_num: 0, longtitude: 21.7322, latitude: 38.2462 },
    { veh_id: 3, veh_vol_id: 4, veh_task_num: 0, longtitude: 21.7389, latitude: 38.2485 },
  ];
  for (const veh of vehiclesData) {
    await prisma.vehicle.create({ data: veh });
  }

  // 9. Announcements
  await prisma.announcement.createMany({
    data: [
      { ann_id: 1, ann_pr_id: 1, ann_value: 5 },
      { ann_id: 2, ann_pr_id: 2, ann_value: 3 },
      { ann_id: 3, ann_pr_id: 7, ann_value: 2 },
      { ann_id: 4, ann_pr_id: 9, ann_value: 2 },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

