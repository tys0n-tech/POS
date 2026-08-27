import { create } from 'zustand';
import { Order, OrderItem, OrderStatus, Payment, PaymentMethod, PaymentStatus } from '../types';
import { initialOrders } from '../data/initialData';
import { sound } from '../utils/audio';
import { syncOrderToSupabase } from '../utils/supabase';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  statusFilter: string; // 'ALL' | OrderStatus
  dateFilter: 'today' | 'yesterday' | 'week' | 'all';
  searchQuery: string;

  setSelectedOrder: (order: Order | null) => void;
  setStatusFilter: (status: string) => void;
  setDateFilter: (filter: 'today' | 'yesterday' | 'week' | 'all') => void;
  setSearchQuery: (query: string) => void;

  createOrder: (orderData: {
    items: OrderItem[];
    subtotal: number;
    discount: number;
    discountType?: 'PERCENTAGE' | 'FIXED' | 'NONE';
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentDetails?: Payment;
    customer?: Order['customer'];
    staffId: string;
    staffName: string;
    registerId: string;
    shiftId: string;
    tableOrPager?: string;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    notes?: string;
  }) => Order;

  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  refundOrder: (orderId: string, reason: string) => { success: boolean; order?: Order };
  getOrderById: (orderId: string) => Order | undefined;
}

const STORAGE_KEY = 'northline_pos_orders';

const loadOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialOrders;
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: loadOrders(),
  selectedOrder: null,
  statusFilter: 'ALL',
  dateFilter: 'all',
  searchQuery: '',

  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setDateFilter: (dateFilter) => set({ dateFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  createOrder: (data) => {
    const orders = get().orders;
    const nextSeq = 1000 + orders.length + 1;
    const orderNumber = `#${nextSeq}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      discountType: data.discountType || 'NONE',
      tax: data.tax,
      total: data.total,
      status: 'NEW',
      paymentStatus: 'PAID',
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
      customer: data.customer,
      staffId: data.staffId,
      staffName: data.staffName,
      registerId: data.registerId,
      shiftId: data.shiftId,
      tableOrPager: data.tableOrPager,
      orderType: data.orderType,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newOrder, ...orders];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ orders: updated });

    // Live sync to Supabase Cloud
    syncOrderToSupabase(newOrder);

    return newOrder;
  },

  updateOrderStatus: (orderId, status) => {
    sound.playClick();
    const now = new Date().toISOString();
    const updated = get().orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          updatedAt: now,
          completedAt: status === 'COMPLETED' ? now : o.completedAt
        };
      }
      return o;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    const selected = get().selectedOrder?.id === orderId
      ? updated.find((o) => o.id === orderId) || null
      : get().selectedOrder;

    set({ orders: updated, selectedOrder: selected });
  },

  refundOrder: (orderId, reason) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return { success: false };

    const now = new Date().toISOString();
    const updatedOrder: Order = {
      ...order,
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      refundReason: reason,
      refundedAt: now,
      updatedAt: now
    };

    const updated = get().orders.map((o) => (o.id === orderId ? updatedOrder : o));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ orders: updated, selectedOrder: updatedOrder });

    return { success: true, order: updatedOrder };
  },

  getOrderById: (orderId) => {
    return get().orders.find((o) => o.id === orderId);
  }
}));
