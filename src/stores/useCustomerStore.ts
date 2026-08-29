import { create } from 'zustand';
import { Customer } from '../types';
import { initialCustomers } from '../data/initialData';
import { syncCustomerToSupabase } from '../utils/supabase';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalOrders' | 'totalSpent' | 'lastVisit'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  recordCustomerOrder: (customerId: string, orderTotal: number, mainProductName?: string) => void;
  findCustomerByPhone: (phone: string) => Customer | undefined;
}

const STORAGE_KEY = 'northline_pos_customers';

const loadCustomers = (): Customer[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialCustomers;
};

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: loadCustomers(),
  selectedCustomer: null,

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  addCustomer: (customerData) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      loyaltyPoints: 0,
      totalOrders: 0,
      totalSpent: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const updated = [newCustomer, ...get().customers];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ customers: updated, selectedCustomer: newCustomer });

    syncCustomerToSupabase(newCustomer);
    return newCustomer;
  },

  updateCustomer: (id, updates) => {
    const updated = get().customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const selectedCustomer = get().selectedCustomer?.id === id ? { ...get().selectedCustomer, ...updates } : get().selectedCustomer;
    set({ customers: updated, selectedCustomer: selectedCustomer as Customer });

    const target = updated.find((c) => c.id === id);
    if (target) syncCustomerToSupabase(target);
  },

  recordCustomerOrder: (customerId, orderTotal, mainProductName) => {
    const earnedPoints = Math.floor(orderTotal / 25);
    let targetCustomer: Customer | undefined;
    const updated = get().customers.map((c) => {
      if (c.id === customerId) {
        const cUpdated = {
          ...c,
          loyaltyPoints: c.loyaltyPoints + earnedPoints,
          totalOrders: c.totalOrders + 1,
          totalSpent: c.totalSpent + orderTotal,
          favoriteProduct: mainProductName || c.favoriteProduct,
          lastVisit: new Date().toISOString()
        };
        targetCustomer = cUpdated;
        return cUpdated;
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ customers: updated });

    if (targetCustomer) syncCustomerToSupabase(targetCustomer);
  },

  findCustomerByPhone: (phone) => {
    const clean = phone.replace(/\D/g, '');
    return get().customers.find((c) => c.phone.replace(/\D/g, '').includes(clean));
  }
}));
