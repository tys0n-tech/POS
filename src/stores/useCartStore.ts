import { create } from 'zustand';
import { Customer, OrderItem, OrderItemModifier, Product } from '../types';
import { sound } from '../utils/audio';

interface CartState {
  items: OrderItem[];
  customer: Customer | null;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  tableOrPager: string;
  notes: string;
  discountAmount: number;
  discountType: 'NONE' | 'FIXED' | 'PERCENTAGE';
  discountValue: number; // e.g. 10 for 10% or 20 for ฿20
  
  // Actions
  addItem: (product: Product, modifiers: OrderItemModifier[], quantity?: number, itemNotes?: string) => void;
  updateItemQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  setCustomer: (customer: Customer | null) => void;
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY') => void;
  setTableOrPager: (value: string) => void;
  setNotes: (notes: string) => void;
  setDiscount: (type: 'NONE' | 'FIXED' | 'PERCENTAGE', value: number) => void;
  clearCart: () => void;

  // Computed values
  getSubtotal: () => number;
  getDiscount: () => number;
  getTax: (vatRate: number, vatIncluded: boolean) => number;
  getTotal: (vatRate: number, vatIncluded: boolean) => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  orderType: 'DINE_IN',
  tableOrPager: '',
  notes: '',
  discountAmount: 0,
  discountType: 'NONE',
  discountValue: 0,

  addItem: (product, modifiers, quantity = 1, itemNotes = '') => {
    sound.playAddToCart();
    const modifierTotal = modifiers.reduce((acc, m) => acc + m.priceDelta, 0);
    const unitPrice = product.basePrice + modifierTotal;

    // Check if an identical product with exact same modifiers already exists
    const existingIndex = get().items.findIndex(
      (item) =>
        item.productId === product.id &&
        item.notes === itemNotes &&
        JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
    );

    if (existingIndex > -1) {
      const updatedItems = [...get().items];
      updatedItems[existingIndex].quantity += quantity;
      set({ items: updatedItems });
    } else {
      const newItem: OrderItem = {
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productName: product.name,
        image: product.image,
        basePrice: product.basePrice,
        unitPrice,
        quantity,
        modifiers,
        notes: itemNotes
      };
      set({ items: [...get().items, newItem] });
    }
  },

  updateItemQuantity: (itemId, delta) => {
    sound.playClick();
    const updated = get().items
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is OrderItem => item !== null);

    set({ items: updated });
  },

  removeItem: (itemId) => {
    sound.playClick();
    set({ items: get().items.filter((i) => i.id !== itemId) });
  },

  updateItemNotes: (itemId, notes) => {
    set({
      items: get().items.map((i) => (i.id === itemId ? { ...i, notes } : i))
    });
  },

  setCustomer: (customer) => set({ customer }),
  setOrderType: (orderType) => set({ orderType }),
  setTableOrPager: (tableOrPager) => set({ tableOrPager }),
  setNotes: (notes) => set({ notes }),

  setDiscount: (discountType, discountValue) => {
    set({ discountType, discountValue });
  },

  clearCart: () => {
    set({
      items: [],
      customer: null,
      orderType: 'DINE_IN',
      tableOrPager: '',
      notes: '',
      discountAmount: 0,
      discountType: 'NONE',
      discountValue: 0
    });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getDiscount: () => {
    const subtotal = get().getSubtotal();
    const { discountType, discountValue } = get();

    if (discountType === 'FIXED') {
      return Math.min(subtotal, discountValue);
    }
    if (discountType === 'PERCENTAGE') {
      return Math.round((subtotal * discountValue) / 100);
    }
    return 0;
  },

  getTax: (vatRate, vatIncluded) => {
    const subtotalAfterDiscount = Math.max(0, get().getSubtotal() - get().getDiscount());
    if (vatRate <= 0) return 0;

    if (vatIncluded) {
      // VAT is already inside price: price * (vatRate / (100 + vatRate))
      return Math.round(subtotalAfterDiscount * (vatRate / (100 + vatRate)));
    } else {
      return Math.round((subtotalAfterDiscount * vatRate) / 100);
    }
  },

  getTotal: (vatRate, vatIncluded) => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const taxableAmount = Math.max(0, subtotal - discount);

    if (vatIncluded || vatRate <= 0) {
      return taxableAmount;
    } else {
      const tax = Math.round((taxableAmount * vatRate) / 100);
      return taxableAmount + tax;
    }
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  }
}));
