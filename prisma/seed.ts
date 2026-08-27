import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Northline Café data into Supabase...');

  // 1. Create Store
  const store = await prisma.store.upsert({
    where: { id: 'store-northline-01' },
    update: {},
    create: {
      id: 'store-northline-01',
      name: 'Northline Café',
      branchName: 'Siam Square Flagship',
      address: '388 Rama 1 Road, Pathum Wan, Bangkok 10330',
      phone: '02-123-4567',
      taxId: '0105565012345',
      vatRate: 7.0,
      vatIncluded: true,
      currencySymbol: '฿',
      receiptHeaderMessage: 'Specialty Coffee & Artisanal Pastries',
      receiptFooterMessage: 'Thank you for visiting Northline Café. Follow @northlinecafe'
    }
  });

  // 2. Create Register
  const register = await prisma.register.upsert({
    where: { code: 'REG-01' },
    update: {},
    create: {
      storeId: store.id,
      name: 'Counter 1 - Main Terminal',
      code: 'REG-01'
    }
  });

  // 3. Create Staff Users
  const staffMembers = [
    { id: 'staff-1', name: 'Tyson', role: 'MANAGER' as const, email: 'tyson@northline.cafe', phone: '0812345678', pin: '1234' },
    { id: 'staff-2', name: 'Sarah', role: 'CASHIER' as const, email: 'sarah@northline.cafe', phone: '0898765432', pin: '0000' },
    { id: 'staff-3', name: 'Liam', role: 'BARISTA' as const, email: 'liam@northline.cafe', phone: '0865554321', pin: '1111' },
    { id: 'staff-4', name: 'Elena', role: 'OWNER' as const, email: 'elena@northline.cafe', phone: '0821112233', pin: '9999' }
  ];

  for (const s of staffMembers) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        id: s.id,
        storeId: store.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: s.role,
        pinHash: s.pin
      }
    });
  }

  // 4. Create Categories
  const categories = [
    { name: 'Coffee', slug: 'coffee', sortOrder: 1 },
    { name: 'Tea', slug: 'tea', sortOrder: 2 },
    { name: 'Matcha', slug: 'matcha', sortOrder: 3 },
    { name: 'Non-Coffee', slug: 'non-coffee', sortOrder: 4 },
    { name: 'Bakery', slug: 'bakery', sortOrder: 5 },
    { name: 'Dessert', slug: 'dessert', sortOrder: 6 },
    { name: 'Seasonal', slug: 'seasonal', sortOrder: 7 }
  ];

  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c
    });
    categoryMap.set(c.name, created.id);
  }

  // 5. Create Ingredients
  const ingredients = [
    { id: 'ing-espresso', name: 'House Blend Coffee Beans', currentStock: 8400, unit: 'G' as const, minimumStock: 3000, costPerUnit: 0.85 },
    { id: 'ing-milk-fresh', name: 'Fresh Whole Milk', currentStock: 26000, unit: 'ML' as const, minimumStock: 8000, costPerUnit: 0.06 },
    { id: 'ing-milk-oat', name: 'Oatly Barista Oat Milk', currentStock: 4000, unit: 'ML' as const, minimumStock: 6000, costPerUnit: 0.14 },
    { id: 'ing-matcha', name: 'Uji Ceremonial Matcha Powder', currentStock: 650, unit: 'G' as const, minimumStock: 200, costPerUnit: 2.2 },
    { id: 'ing-croissant', name: 'French Butter Croissant', currentStock: 24, unit: 'PCS' as const, minimumStock: 10, costPerUnit: 35.0 }
  ];

  for (const ing of ingredients) {
    await prisma.ingredient.upsert({
      where: { id: ing.id },
      update: {},
      create: {
        id: ing.id,
        storeId: store.id,
        name: ing.name,
        currentStock: ing.currentStock,
        unit: ing.unit,
        minimumStock: ing.minimumStock,
        costPerUnit: ing.costPerUnit
      }
    });
  }

  // 6. Create Modifier Groups
  const modSize = await prisma.modifierGroup.create({
    data: {
      name: 'SIZE',
      type: 'SINGLE',
      required: true,
      options: {
        create: [
          { name: 'Small (8oz)', priceDelta: 0 },
          { name: 'Medium (12oz)', priceDelta: 10, isDefault: true },
          { name: 'Large (16oz)', priceDelta: 20 }
        ]
      }
    }
  });

  const modMilk = await prisma.modifierGroup.create({
    data: {
      name: 'MILK',
      type: 'SINGLE',
      required: true,
      options: {
        create: [
          { name: 'Fresh Milk', priceDelta: 0, isDefault: true },
          { name: 'Oat Milk (Oatly)', priceDelta: 20 },
          { name: 'Almond Milk', priceDelta: 25 }
        ]
      }
    }
  });

  // 7. Create Demo Products
  const coffeeCatId = categoryMap.get('Coffee')!;
  const bakeryCatId = categoryMap.get('Bakery')!;

  const latte = await prisma.product.upsert({
    where: { sku: 'COF-LAT-01' },
    update: {},
    create: {
      storeId: store.id,
      categoryId: coffeeCatId,
      name: 'Iced Latte',
      description: 'Smooth espresso with fresh velvety milk',
      basePrice: 85,
      costPrice: 28,
      sku: 'COF-LAT-01',
      barcode: '8851001001',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
      available: true,
      soldCount: 124,
      recipeItems: {
        create: [
          { ingredientId: 'ing-espresso', quantity: 18 },
          { ingredientId: 'ing-milk-fresh', quantity: 180 }
        ]
      }
    }
  });

  const croissant = await prisma.product.upsert({
    where: { sku: 'BAK-CRS-08' },
    update: {},
    create: {
      storeId: store.id,
      categoryId: bakeryCatId,
      name: 'Artisanal Butter Croissant',
      description: 'AOP Isigny butter, 27-layer flaky crust',
      basePrice: 75,
      costPrice: 35,
      sku: 'BAK-CRS-08',
      barcode: '8851001008',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
      available: true,
      soldCount: 76,
      recipeItems: {
        create: [
          { ingredientId: 'ing-croissant', quantity: 1 }
        ]
      }
    }
  });

  // 8. Create Demo Customers
  await prisma.customer.upsert({
    where: { phone: '0814455667' },
    update: {},
    create: {
      storeId: store.id,
      name: 'Natthapong S.',
      phone: '0814455667',
      email: 'natthapong@example.com',
      loyaltyPoints: 340,
      totalOrders: 28,
      totalSpent: 3850,
      favoriteProduct: 'Iced Latte'
    }
  });

  console.log('✅ Supabase database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
