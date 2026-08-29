import { Table, Coupon } from '../types';

export const initialTables: Table[] = [
  // INDOOR ZONE (Main Hall)
  { id: 'tbl-in-1', number: 'T01', name: 'Table 1', zone: 'INDOOR', capacity: 2, status: 'AVAILABLE' },
  { id: 'tbl-in-2', number: 'T02', name: 'Table 2', zone: 'INDOOR', capacity: 2, status: 'OCCUPIED', currentOrderNumber: '#1024', currentBillAmount: 320, seatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), guestCount: 2 },
  { id: 'tbl-in-3', number: 'T03', name: 'Table 3', zone: 'INDOOR', capacity: 4, status: 'AVAILABLE' },
  { id: 'tbl-in-4', number: 'T04', name: 'Table 4', zone: 'INDOOR', capacity: 4, status: 'OCCUPIED', currentOrderNumber: '#1025', currentBillAmount: 580, seatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), guestCount: 3 },
  { id: 'tbl-in-5', number: 'T05', name: 'Table 5', zone: 'INDOOR', capacity: 6, status: 'AVAILABLE' },
  { id: 'tbl-in-6', number: 'T06', name: 'Table 6', zone: 'INDOOR', capacity: 4, status: 'RESERVED', guestCount: 4 },

  // OUTDOOR ZONE (Garden & Terrace)
  { id: 'tbl-out-1', number: 'O01', name: 'Outdoor 1', zone: 'OUTDOOR', capacity: 2, status: 'AVAILABLE' },
  { id: 'tbl-out-2', number: 'O02', name: 'Outdoor 2', zone: 'OUTDOOR', capacity: 4, status: 'AVAILABLE' },
  { id: 'tbl-out-3', number: 'O03', name: 'Outdoor 3', zone: 'OUTDOOR', capacity: 4, status: 'OCCUPIED', currentOrderNumber: '#1026', currentBillAmount: 240, seatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), guestCount: 2 },
  { id: 'tbl-out-4', number: 'O04', name: 'Outdoor 4', zone: 'OUTDOOR', capacity: 6, status: 'AVAILABLE' },

  // BAR ZONE
  { id: 'tbl-bar-1', number: 'B01', name: 'Bar Seat 1', zone: 'BAR', capacity: 1, status: 'AVAILABLE' },
  { id: 'tbl-bar-2', number: 'B02', name: 'Bar Seat 2', zone: 'BAR', capacity: 1, status: 'OCCUPIED', currentOrderNumber: '#1027', currentBillAmount: 140, seatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), guestCount: 1 },
  { id: 'tbl-bar-3', number: 'B03', name: 'Bar Seat 3', zone: 'BAR', capacity: 1, status: 'AVAILABLE' },
  { id: 'tbl-bar-4', number: 'B04', name: 'Bar Seat 4', zone: 'BAR', capacity: 1, status: 'AVAILABLE' },

  // VIP ROOM
  { id: 'tbl-vip-1', number: 'VIP-1', name: 'VIP Lounge 1', zone: 'VIP', capacity: 8, status: 'AVAILABLE' },
  { id: 'tbl-vip-2', number: 'VIP-2', name: 'VIP Meeting Room', zone: 'VIP', capacity: 12, status: 'RESERVED', guestCount: 8 }
];

export const initialCoupons: Coupon[] = [
  {
    id: 'cp-1',
    code: 'NORTHLINE10',
    description: '10% Discount on all beverages',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    active: true
  },
  {
    id: 'cp-2',
    code: 'WELCOME50',
    description: '฿50 Off on orders above ฿200',
    discountType: 'FIXED',
    discountValue: 50,
    minSpend: 200,
    active: true
  },
  {
    id: 'cp-3',
    code: 'VIP20',
    description: '20% VIP Exclusive Discount',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    active: true
  },
  {
    id: 'cp-4',
    code: 'COFFEELOVER',
    description: '15% Off Specialty Coffee',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minSpend: 150,
    active: true
  }
];
