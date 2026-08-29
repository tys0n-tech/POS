export type StaffRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'BARISTA';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  pin: string;
  avatar?: string;
  email: string;
  phone: string;
  active: boolean;
}

export type Category = 'All' | 'Coffee' | 'Tea' | 'Matcha' | 'Non-Coffee' | 'Bakery' | 'Dessert' | 'Seasonal';

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string; // e.g. "Size", "Milk", "Sweetness", "Ice", "Extras"
  type: 'SINGLE' | 'MULTIPLE';
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: ModifierOption[];
}

export interface Ingredient {
  id: string;
  name: string;
  currentStock: number;
  unit: 'g' | 'ml' | 'pcs' | 'shots' | 'kg' | 'L';
  minimumStock: number;
  costPerUnit: number;
  updatedAt: string;
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  basePrice: number;
  costPrice: number;
  sku: string;
  barcode: string;
  image: string;
  available: boolean;
  modifierGroupIds: string[]; // references ModifierGroup
  recipe: RecipeItem[];
  soldCount?: number;
}

export interface OrderItemModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  unitPrice: number; // basePrice + modifiers
  basePrice: number;
  quantity: number;
  modifiers: OrderItemModifier[];
  notes?: string;
}

export type OrderStatus = 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIAL_REFUND';
export type PaymentMethod = 'CASH' | 'PROMPTPAY' | 'CREDIT_CARD' | 'QR_CODE';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  receivedAmount?: number;
  changeAmount?: number;
  status: PaymentStatus;
  transactionRef?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  favoriteProduct?: string;
  lastVisit: string;
  createdAt: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#1024"
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType?: 'PERCENTAGE' | 'FIXED' | 'NONE';
  tax: number; // e.g. 7% VAT
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDetails?: Payment;
  customer?: Customer | null;
  staffId: string;
  staffName: string;
  registerId: string;
  shiftId: string;
  tableOrPager?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundReason?: string;
  refundedAt?: string;
}

export interface ShiftCashEntry {
  id: string;
  type: 'CASH_IN' | 'CASH_OUT' | 'SALE' | 'REFUND';
  amount: number;
  reason: string;
  timestamp: string;
  staffName: string;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  registerName: string;
  startTime: string;
  endTime?: string;
  status: 'OPEN' | 'CLOSED';
  startingCash: number;
  cashSales: number;
  digitalSales: number;
  cashRefunds: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  cashEntries: ShiftCashEntry[];
  note?: string;
}

export interface InventoryTransaction {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTE';
  quantityChange: number; // + or -
  quantityAfter: number;
  unit: string;
  reason: string;
  staffName: string;
  orderId?: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  branchName: string;
  address: string;
  phone: string;
  taxId: string;
  vatRate: number; // e.g. 7 (for 7%)
  vatIncluded: boolean;
  serviceChargeRate: number;
  currencySymbol: string;
  receiptHeaderMessage: string;
  receiptFooterMessage: string;
  printerPaperWidth: '80mm' | '58mm';
  enableAudio: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'th';
  
  // Hardware Peripherals & Bridges
  edcTerminalType: 'DISABLED' | 'IP_LAN' | 'BLUETOOTH' | 'USB_SERIAL';
  edcTerminalIp: string;
  edcTerminalPort: number;
  edcMerchantId: string;
  scaleType: 'DISABLED' | 'WEB_SERIAL' | 'BLUETOOTH_BLE' | 'SIMULATOR';
  scaleBaudRate: number;
  scaleUnit: 'g' | 'kg' | 'oz';
  networkPrinterIp: string;
  networkPrinterPort: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export type TableZone = 'INDOOR' | 'OUTDOOR' | 'BAR' | 'VIP';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILL_PRINTED';

export interface Table {
  id: string;
  number: string; // e.g. "T01", "B01", "VIP-1"
  name: string;   // e.g. "Table 1"
  zone: TableZone;
  capacity: number; // e.g. 2, 4, 6, 8 seats
  status: TableStatus;
  currentOrderId?: string;
  currentOrderNumber?: string;
  currentBillAmount?: number;
  seatedAt?: string;
  guestCount?: number;
}

export interface Coupon {
  id: string;
  code: string; // e.g. "NORTHLINE10"
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number; // e.g. 10 for 10%, 50 for 50 THB
  minSpend?: number;
  validUntil?: string;
  active: boolean;
}
