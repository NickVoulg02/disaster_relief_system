import fs from 'fs/promises';
import path from 'path';
import { prisma } from './prisma';

/**
 * Synchronizes the product & category catalogue to public/data.json
 * (replaces legacy test/base/json_creator.php).
 */
export async function syncProductJson() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { pr_id: 'asc' },
    });

    const formatted = products.map((p) => ({
      pr_name: p.pr_name,
      pr_id: p.pr_id,
      pr_cat_id: p.pr_cat_id,
      detail_name: p.detail_name,
      detail_value: p.detail_value,
      cat_name: p.category.cat_name,
    }));

    const filePath = path.join(process.cwd(), 'public', 'data.json');
    await fs.writeFile(filePath, JSON.stringify(formatted, null, 2), 'utf-8');
    return formatted;
  } catch (err) {
    console.error('Failed to sync data.json:', err);
    return [];
  }
}

