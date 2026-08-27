import { 
  Staff, 
  ModifierGroup, 
  Ingredient, 
  Product, 
  Customer, 
  Order, 
  Shift, 
  StoreSettings,
  InventoryTransaction
} from '../types';

export const initialStaff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Tyson',
    role: 'MANAGER',
    pin: '1234',
    email: 'tyson@northline.cafe',
    phone: '0812345678',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-2',
    name: 'Sarah',
    role: 'CASHIER',
    pin: '0000',
    email: 'sarah@northline.cafe',
    phone: '0898765432',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-3',
    name: 'Liam',
    role: 'BARISTA',
    pin: '1111',
    email: 'liam@northline.cafe',
    phone: '0865554321',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-4',
    name: 'Elena',
    role: 'OWNER',
    pin: '9999',
    email: 'elena@northline.cafe',
    phone: '0821112233',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export const initialModifierGroups: ModifierGroup[] = [
  {
    id: 'mg-size',
    name: 'SIZE',
    type: 'SINGLE',
    required: true,
    options: [
      { id: 'opt-sz-sm', name: 'Small (8oz)', priceDelta: 0 },
      { id: 'opt-sz-md', name: 'Medium (12oz)', priceDelta: 10, isDefault: true },
      { id: 'opt-sz-lg', name: 'Large (16oz)', priceDelta: 20 }
    ]
  },
  {
    id: 'mg-milk',
    name: 'MILK',
    type: 'SINGLE',
    required: true,
    options: [
      { id: 'opt-milk-fresh', name: 'Fresh Milk', priceDelta: 0, isDefault: true },
      { id: 'opt-milk-oat', name: 'Oat Milk (Oatly)', priceDelta: 20 },
      { id: 'opt-milk-almond', name: 'Almond Milk', priceDelta: 25 },
      { id: 'opt-milk-soy', name: 'Soy Milk', priceDelta: 15 }
    ]
  },
  {
    id: 'mg-sweetness',
    name: 'SWEETNESS',
    type: 'SINGLE',
    required: true,
    options: [
      { id: 'opt-sw-0', name: '0% No Sugar', priceDelta: 0 },
      { id: 'opt-sw-25', name: '25% Less Sweet', priceDelta: 0 },
      { id: 'opt-sw-50', name: '50% Half Sweet', priceDelta: 0, isDefault: true },
      { id: 'opt-sw-75', name: '75% Mild Sweet', priceDelta: 0 },
      { id: 'opt-sw-100', name: '100% Normal', priceDelta: 0 }
    ]
  },
  {
    id: 'mg-ice',
    name: 'ICE LEVEL',
    type: 'SINGLE',
    required: true,
    options: [
      { id: 'opt-ice-none', name: 'No Ice', priceDelta: 0 },
      { id: 'opt-ice-less', name: 'Less Ice', priceDelta: 0, isDefault: true },
      { id: 'opt-ice-normal', name: 'Normal Ice', priceDelta: 0 }
    ]
  },
  {
    id: 'mg-extras',
    name: 'EXTRAS',
    type: 'MULTIPLE',
    required: false,
    options: [
      { id: 'opt-ext-shot', name: 'Extra Double Shot', priceDelta: 20 },
      { id: 'opt-ext-vanilla', name: 'Madagascar Vanilla Syrup', priceDelta: 15 },
      { id: 'opt-ext-caramel', name: 'Salted Caramel Drizzle', priceDelta: 15 },
      { id: 'opt-ext-whip', name: 'Fresh Whipped Cream', priceDelta: 15 }
    ]
  },
  {
    id: 'mg-bakery-heat',
    name: 'SERVING OPTION',
    type: 'SINGLE',
    required: true,
    options: [
      { id: 'opt-bk-warm', name: 'Warmed Up', priceDelta: 0, isDefault: true },
      { id: 'opt-bk-room', name: 'Room Temperature', priceDelta: 0 }
    ]
  }
];

export const initialIngredients: Ingredient[] = [
  {
    id: 'ing-espresso',
    name: 'House Blend Coffee Beans (Ethiopia & Brazil)',
    currentStock: 8400, // in grams (8.4 kg)
    unit: 'g',
    minimumStock: 3000,
    costPerUnit: 0.85,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-milk-fresh',
    name: 'Fresh Whole Milk',
    currentStock: 26000, // in ml (26 L)
    unit: 'ml',
    minimumStock: 8000,
    costPerUnit: 0.06,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-milk-oat',
    name: 'Oatly Barista Oat Milk',
    currentStock: 4000, // in ml (4 L - Low stock demo)
    unit: 'ml',
    minimumStock: 6000,
    costPerUnit: 0.14,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-milk-almond',
    name: 'Almond Milk (Unsweetened)',
    currentStock: 3500,
    unit: 'ml',
    minimumStock: 3000,
    costPerUnit: 0.16,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-matcha',
    name: 'Uji Ceremonial Matcha Powder',
    currentStock: 650, // in grams
    unit: 'g',
    minimumStock: 200,
    costPerUnit: 2.2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-thai-tea',
    name: 'Hand-Picked Thai Tea Leaves',
    currentStock: 1800,
    unit: 'g',
    minimumStock: 500,
    costPerUnit: 0.45,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-valrhona',
    name: 'Valrhona 70% Dark Chocolate',
    currentStock: 2200,
    unit: 'g',
    minimumStock: 1000,
    costPerUnit: 1.1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-croissant',
    name: 'French Butter Croissant',
    currentStock: 24,
    unit: 'pcs',
    minimumStock: 10,
    costPerUnit: 35,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-cheesecake',
    name: 'Blueberry Basque Cheesecake Slice',
    currentStock: 14,
    unit: 'pcs',
    minimumStock: 6,
    costPerUnit: 55,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-cups-cold',
    name: '16oz Clear Eco Cup & Lid',
    currentStock: 450,
    unit: 'pcs',
    minimumStock: 150,
    costPerUnit: 2.5,
    updatedAt: new Date().toISOString()
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-latte',
    name: 'Iced Latte',
    description: 'Smooth espresso with fresh velvety milk',
    category: 'Coffee',
    basePrice: 85,
    costPrice: 28,
    sku: 'COF-LAT-01',
    barcode: '8851001001',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-size', 'mg-milk', 'mg-sweetness', 'mg-ice', 'mg-extras'],
    recipe: [
      { ingredientId: 'ing-espresso', ingredientName: 'Coffee Beans', quantity: 18, unit: 'g' },
      { ingredientId: 'ing-milk-fresh', ingredientName: 'Fresh Milk', quantity: 180, unit: 'ml' },
      { ingredientId: 'ing-cups-cold', ingredientName: '16oz Eco Cup', quantity: 1, unit: 'pcs' }
    ],
    soldCount: 124
  },
  {
    id: 'prod-americano',
    name: 'Iced Americano',
    description: 'Clean double espresso poured over chilled water',
    category: 'Coffee',
    basePrice: 70,
    costPrice: 18,
    sku: 'COF-AME-02',
    barcode: '8851001002',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-size', 'mg-sweetness', 'mg-ice', 'mg-extras'],
    recipe: [
      { ingredientId: 'ing-espresso', ingredientName: 'Coffee Beans', quantity: 18, unit: 'g' },
      { ingredientId: 'ing-cups-cold', ingredientName: '16oz Eco Cup', quantity: 1, unit: 'pcs' }
    ],
    soldCount: 98
  },
  {
    id: 'prod-dirty',
    name: 'Dirty Coffee',
    description: 'Hot ristretto extracted onto freezing cold sweetened cream milk',
    category: 'Coffee',
    basePrice: 95,
    costPrice: 32,
    sku: 'COF-DRT-03',
    barcode: '8851001003',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-milk', 'mg-sweetness', 'mg-extras'],
    recipe: [
      { ingredientId: 'ing-espresso', ingredientName: 'Coffee Beans', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-milk-fresh', ingredientName: 'Fresh Milk', quantity: 120, unit: 'ml' }
    ],
    soldCount: 65
  },
  {
    id: 'prod-cappuccino',
    name: 'Cappuccino',
    description: 'Rich espresso with dense microfoam dusted with cocoa',
    category: 'Coffee',
    basePrice: 80,
    costPrice: 26,
    sku: 'COF-CAP-04',
    barcode: '8851001004',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-size', 'mg-milk', 'mg-sweetness', 'mg-extras'],
    recipe: [
      { ingredientId: 'ing-espresso', ingredientName: 'Coffee Beans', quantity: 18, unit: 'g' },
      { ingredientId: 'ing-milk-fresh', ingredientName: 'Fresh Milk', quantity: 150, unit: 'ml' }
    ],
    soldCount: 54
  },
  {
    id: 'prod-matcha',
    name: 'Uji Matcha Latte',
    description: 'First harvest stone-ground Kyoto matcha with fresh milk',
    category: 'Matcha',
    basePrice: 95,
    costPrice: 35,
    sku: 'MAT-LAT-05',
    barcode: '8851001005',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-size', 'mg-milk', 'mg-sweetness', 'mg-ice', 'mg-extras'],
    recipe: [
      { ingredientId: 'ing-matcha', ingredientName: 'Matcha Powder', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-milk-fresh', ingredientName: 'Fresh Milk', quantity: 180, unit: 'ml' },
      { ingredientId: 'ing-cups-cold', ingredientName: '16oz Eco Cup', quantity: 1, unit: 'pcs' }
    ],
    soldCount: 88
  },
  {
    id: 'prod-thai-tea',
    name: 'Thai Tea Craft',
    description: 'Traditional slow-brewed tea infused with gentle spices & milk',
    category: 'Tea',
    basePrice: 75,
    costPrice: 22,
    sku: 'TEA-THI-06',
    barcode: '8851001006',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-size', 'mg-milk', 'mg-sweetness', 'mg-ice', 'mg-extras'],
    recipe: [
      { ingredientId: 'ing-thai-tea', ingredientName: 'Thai Tea Leaves', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-milk-fresh', ingredientName: 'Fresh Milk', quantity: 160, unit: 'ml' },
      { ingredientId: 'ing-cups-cold', ingredientName: '16oz Eco Cup', quantity: 1, unit: 'pcs' }
    ],
    soldCount: 72
  },
  {
    id: 'prod-chocolate',
    name: 'Valrhona Dark Chocolate',
    description: '70% Guanaja single-origin chocolate melted into steamed milk',
    category: 'Non-Coffee',
    basePrice: 90,
    costPrice: 34,
    sku: 'NCH-VAL-07',
    barcode: '8851001007',
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-size', 'mg-milk', 'mg-sweetness', 'mg-ice', 'mg-extras'],
    recipe: [
      { ingredientId: 'ing-valrhona', ingredientName: 'Valrhona Chocolate', quantity: 30, unit: 'g' },
      { ingredientId: 'ing-milk-fresh', ingredientName: 'Fresh Milk', quantity: 180, unit: 'ml' },
      { ingredientId: 'ing-cups-cold', ingredientName: '16oz Eco Cup', quantity: 1, unit: 'pcs' }
    ],
    soldCount: 46
  },
  {
    id: 'prod-croissant',
    name: 'Artisanal Butter Croissant',
    description: 'AOP Isigny butter, 27-layer flaky crust, light honeycomb crumb',
    category: 'Bakery',
    basePrice: 75,
    costPrice: 35,
    sku: 'BAK-CRS-08',
    barcode: '8851001008',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-bakery-heat'],
    recipe: [
      { ingredientId: 'ing-croissant', ingredientName: 'Butter Croissant', quantity: 1, unit: 'pcs' }
    ],
    soldCount: 76
  },
  {
    id: 'prod-cheesecake',
    name: 'Blueberry Basque Cheesecake',
    description: 'Caramelized burnt exterior with ultra-creamy molten vanilla center',
    category: 'Dessert',
    basePrice: 125,
    costPrice: 55,
    sku: 'DST-CHK-09',
    barcode: '8851001009',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: [],
    recipe: [
      { ingredientId: 'ing-cheesecake', ingredientName: 'Cheesecake Slice', quantity: 1, unit: 'pcs' }
    ],
    soldCount: 42
  },
  {
    id: 'prod-yuzu-sparkling',
    name: 'Yuzu Sparkling Espresso',
    description: 'Japanese Kochi yuzu puree with sparkling water topped with espresso',
    category: 'Seasonal',
    basePrice: 110,
    costPrice: 38,
    sku: 'SEA-YZU-10',
    barcode: '8851001010',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    available: true,
    modifierGroupIds: ['mg-sweetness', 'mg-ice'],
    recipe: [
      { ingredientId: 'ing-espresso', ingredientName: 'Coffee Beans', quantity: 18, unit: 'g' },
      { ingredientId: 'ing-cups-cold', ingredientName: '16oz Eco Cup', quantity: 1, unit: 'pcs' }
    ],
    soldCount: 39
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Natthapong S.',
    phone: '0814455667',
    email: 'natthapong@example.com',
    loyaltyPoints: 340,
    totalOrders: 28,
    totalSpent: 3850,
    favoriteProduct: 'Iced Latte',
    lastVisit: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: '2026-01-15T09:00:00Z',
    notes: 'Prefers Oat Milk & Less Sweet'
  },
  {
    id: 'cust-2',
    name: 'Siriporn T.',
    phone: '0892233445',
    email: 'siriporn@example.com',
    loyaltyPoints: 180,
    totalOrders: 14,
    totalSpent: 1960,
    favoriteProduct: 'Uji Matcha Latte',
    lastVisit: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: '2026-03-10T11:20:00Z'
  },
  {
    id: 'cust-3',
    name: 'Alexander Ross',
    phone: '0869988776',
    email: 'alex.ross@example.com',
    loyaltyPoints: 520,
    totalOrders: 42,
    totalSpent: 5400,
    favoriteProduct: 'Dirty Coffee',
    lastVisit: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: '2025-11-04T08:30:00Z'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1021',
    orderNumber: '#1021',
    items: [
      {
        id: 'item-1',
        productId: 'prod-latte',
        productName: 'Iced Latte',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
        basePrice: 85,
        unitPrice: 105,
        quantity: 1,
        modifiers: [
          { groupId: 'mg-size', groupName: 'SIZE', optionId: 'opt-sz-md', optionName: 'Medium (12oz)', priceDelta: 10 },
          { groupId: 'mg-milk', groupName: 'MILK', optionId: 'opt-milk-fresh', optionName: 'Fresh Milk', priceDelta: 0 },
          { groupId: 'mg-sweetness', groupName: 'SWEETNESS', optionId: 'opt-sw-50', optionName: '50% Half Sweet', priceDelta: 0 },
          { groupId: 'mg-ice', groupName: 'ICE LEVEL', optionId: 'opt-ice-less', optionName: 'Less Ice', priceDelta: 0 },
          { groupId: 'mg-extras', groupName: 'EXTRAS', optionId: 'opt-ext-caramel', optionName: 'Salted Caramel Drizzle', priceDelta: 15 }
        ]
      },
      {
        id: 'item-2',
        productId: 'prod-croissant',
        productName: 'Artisanal Butter Croissant',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
        basePrice: 75,
        unitPrice: 75,
        quantity: 1,
        modifiers: [
          { groupId: 'mg-bakery-heat', groupName: 'SERVING OPTION', optionId: 'opt-bk-warm', optionName: 'Warmed Up', priceDelta: 0 }
        ]
      }
    ],
    subtotal: 185,
    discount: 10,
    tax: 0,
    total: 175,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'PROMPTPAY',
    customer: initialCustomers[0],
    staffId: 'staff-1',
    staffName: 'Tyson',
    registerId: 'reg-01',
    shiftId: 'shift-today-01',
    orderType: 'DINE_IN',
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2.3).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2.3).toISOString()
  },
  {
    id: 'ord-1022',
    orderNumber: '#1022',
    items: [
      {
        id: 'item-3',
        productId: 'prod-matcha',
        productName: 'Uji Matcha Latte',
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
        basePrice: 95,
        unitPrice: 115,
        quantity: 1,
        modifiers: [
          { groupId: 'mg-size', groupName: 'SIZE', optionId: 'opt-sz-md', optionName: 'Medium (12oz)', priceDelta: 10 },
          { groupId: 'mg-milk', groupName: 'MILK', optionId: 'opt-milk-oat', optionName: 'Oat Milk (Oatly)', priceDelta: 20 },
          { groupId: 'mg-sweetness', groupName: 'SWEETNESS', optionId: 'opt-sw-25', optionName: '25% Less Sweet', priceDelta: 0 }
        ]
      }
    ],
    subtotal: 125,
    discount: 0,
    tax: 0,
    total: 125,
    status: 'READY',
    paymentStatus: 'PAID',
    paymentMethod: 'CREDIT_CARD',
    customer: initialCustomers[1],
    staffId: 'staff-2',
    staffName: 'Sarah',
    registerId: 'reg-01',
    shiftId: 'shift-today-01',
    orderType: 'TAKEAWAY',
    createdAt: new Date(Date.now() - 600000 * 1).toISOString(), // 10 mins ago
    updatedAt: new Date(Date.now() - 60000 * 3).toISOString()
  },
  {
    id: 'ord-1023',
    orderNumber: '#1023',
    items: [
      {
        id: 'item-4',
        productId: 'prod-americano',
        productName: 'Iced Americano',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
        basePrice: 70,
        unitPrice: 70,
        quantity: 2,
        modifiers: [
          { groupId: 'mg-sweetness', groupName: 'SWEETNESS', optionId: 'opt-sw-0', optionName: '0% No Sugar', priceDelta: 0 },
          { groupId: 'mg-ice', groupName: 'ICE LEVEL', optionId: 'opt-ice-normal', optionName: 'Normal Ice', priceDelta: 0 }
        ]
      },
      {
        id: 'item-5',
        productId: 'prod-cheesecake',
        productName: 'Blueberry Basque Cheesecake',
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
        basePrice: 125,
        unitPrice: 125,
        quantity: 1,
        modifiers: []
      }
    ],
    subtotal: 265,
    discount: 0,
    tax: 0,
    total: 265,
    status: 'PREPARING',
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    customer: null,
    staffId: 'staff-1',
    staffName: 'Tyson',
    registerId: 'reg-01',
    shiftId: 'shift-today-01',
    orderType: 'DINE_IN',
    tableOrPager: 'Table 4',
    createdAt: new Date(Date.now() - 180000).toISOString(), // 3 mins ago
    updatedAt: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'ord-1024',
    orderNumber: '#1024',
    items: [
      {
        id: 'item-6',
        productId: 'prod-dirty',
        productName: 'Dirty Coffee',
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80',
        basePrice: 95,
        unitPrice: 115,
        quantity: 1,
        modifiers: [
          { groupId: 'mg-extras', groupName: 'EXTRAS', optionId: 'opt-ext-shot', optionName: 'Extra Double Shot', priceDelta: 20 }
        ]
      }
    ],
    subtotal: 115,
    discount: 0,
    tax: 0,
    total: 115,
    status: 'NEW',
    paymentStatus: 'PAID',
    paymentMethod: 'PROMPTPAY',
    customer: initialCustomers[2],
    staffId: 'staff-2',
    staffName: 'Sarah',
    registerId: 'reg-01',
    shiftId: 'shift-today-01',
    orderType: 'DINE_IN',
    createdAt: new Date(Date.now() - 45000).toISOString(), // 45s ago
    updatedAt: new Date(Date.now() - 45000).toISOString()
  }
];

export const initialShift: Shift = {
  id: 'shift-today-01',
  staffId: 'staff-1',
  staffName: 'Tyson',
  registerName: 'Main Terminal (Counter 1)',
  startTime: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
  status: 'OPEN',
  startingCash: 2000,
  cashSales: 6450,
  digitalSales: 6390,
  cashRefunds: 0,
  cashIn: 0,
  cashOut: 0,
  expectedCash: 8450,
  cashEntries: [
    {
      id: 'entry-1',
      type: 'CASH_IN',
      amount: 2000,
      reason: 'Opening Float Cash',
      timestamp: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
      staffName: 'Tyson'
    }
  ]
};

export const initialStoreSettings: StoreSettings = {
  storeName: 'Northline Café',
  branchName: 'Siam Square Flagship',
  address: '388 Rama 1 Road, Pathum Wan, Bangkok 10330',
  phone: '02-123-4567',
  taxId: '0105565012345',
  vatRate: 7,
  vatIncluded: true,
  serviceChargeRate: 0,
  currencySymbol: '฿',
  receiptHeaderMessage: 'Specialty Coffee & Artisanal Pastries',
  receiptFooterMessage: 'Thank you for visiting Northline Café. Follow @northlinecafe',
  printerPaperWidth: '80mm',
  enableAudio: true,
  theme: 'light',
  language: 'en'
};

export const initialInventoryTransactions: InventoryTransaction[] = [
  {
    id: 'txn-01',
    ingredientId: 'ing-espresso',
    ingredientName: 'House Blend Coffee Beans',
    type: 'PURCHASE',
    quantityChange: 10000,
    quantityAfter: 12000,
    unit: 'g',
    reason: 'Weekly Roastery Delivery',
    staffName: 'Tyson',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'txn-02',
    ingredientId: 'ing-milk-oat',
    ingredientName: 'Oatly Barista Oat Milk',
    type: 'USAGE',
    quantityChange: -2000,
    quantityAfter: 4000,
    unit: 'ml',
    reason: 'Bar Station Daily Consumption',
    staffName: 'Liam',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];
