import { createClient } from '@supabase/supabase-js';
import { Order, Product, Ingredient, Customer, Staff, Shift, InventoryTransaction } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hplrcgegycrexyfzmuwu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// ==========================================
// 1. ORDER & REALTIME SYNC
// ==========================================

export async function syncOrderToSupabase(order: Order) {
  if (!isSupabaseConfigured) return null;

  try {
    // 1. Upsert Order Header
    const { error: orderError } = await supabase.from('orders').upsert({
      id: order.id,
      storeId: 'store-northline-01',
      registerId: order.registerId || 'REG-01',
      shiftId: order.shiftId || 'shift-today-01',
      staffId: order.staffId || 'staff-1',
      customerId: order.customer?.id || null,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      tableOrPager: order.tableOrPager || null,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || 'PROMPTPAY',
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      notes: order.notes || null,
      refundReason: order.refundReason || null,
      refundedAt: order.refundedAt || null,
      completedAt: order.completedAt || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });

    if (orderError) {
      console.warn('Supabase sync order header warning:', orderError.message);
    }

    // 2. Upsert Order Items (if items exist)
    if (order.items && order.items.length > 0) {
      const itemsPayload = order.items.map((item, index) => ({
        id: item.id || `item-${order.id}-${index}`,
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        basePrice: item.basePrice,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        notes: item.notes || null
      }));

      const { error: itemsError } = await supabase.from('order_items').upsert(itemsPayload);
      if (itemsError) {
        console.warn('Supabase sync order items warning:', itemsError.message);
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to sync order to Supabase:', err);
    return null;
  }
}

export async function updateOrderStatusInSupabase(orderId: string, status: string, completedAt?: string) {
  if (!isSupabaseConfigured) return null;

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        completedAt: completedAt || null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) console.warn('Supabase status update warning:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to update order status in Supabase:', err);
    return null;
  }
}

export function subscribeToOrdersRealtime(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel('pos-orders-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ==========================================
// 2. INVENTORY SYNC
// ==========================================

export async function syncInventoryTransactionToSupabase(txnData: {
  id: string;
  ingredientId: string;
  type: string;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  staffName: string;
  orderId?: string;
}) {
  if (!isSupabaseConfigured) return null;

  try {
    const { error } = await supabase.from('inventory_transactions').upsert({
      id: txnData.id,
      ingredientId: txnData.ingredientId,
      userId: 'staff-1',
      orderId: txnData.orderId || null,
      type: txnData.type,
      quantityChange: txnData.quantityChange,
      quantityAfter: txnData.quantityAfter,
      reason: txnData.reason,
      createdAt: new Date().toISOString()
    });

    if (error) console.warn('Supabase sync inventory warning:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to sync inventory to Supabase:', err);
    return null;
  }
}

export async function syncIngredientStockToSupabase(ingredientId: string, currentStock: number) {
  if (!isSupabaseConfigured) return null;

  try {
    const { error } = await supabase
      .from('ingredients')
      .update({
        currentStock,
        updatedAt: new Date().toISOString()
      })
      .eq('id', ingredientId);

    if (error) console.warn('Supabase update ingredient warning:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to update ingredient in Supabase:', err);
    return null;
  }
}

// ==========================================
// 3. SHIFTS & CASH SYNC
// ==========================================

export async function syncShiftToSupabase(shift: Shift) {
  if (!isSupabaseConfigured) return null;

  try {
    const { error } = await supabase.from('shifts').upsert({
      id: shift.id,
      storeId: 'store-northline-01',
      registerId: 'REG-01',
      openedById: shift.staffId || 'staff-1',
      startTime: shift.startTime,
      endTime: shift.endTime || null,
      status: shift.status,
      startingCash: shift.startingCash,
      cashSales: shift.cashSales,
      digitalSales: shift.digitalSales,
      cashRefunds: shift.cashRefunds,
      cashIn: shift.cashIn,
      cashOut: shift.cashOut,
      expectedCash: shift.expectedCash,
      actualCash: shift.actualCash || null,
      difference: shift.difference || null,
      closingNote: shift.note || null
    });

    if (error) console.warn('Supabase sync shift warning:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to sync shift to Supabase:', err);
    return null;
  }
}

// ==========================================
// 4. CUSTOMER SYNC
// ==========================================

export async function syncCustomerToSupabase(customer: Customer) {
  if (!isSupabaseConfigured) return null;

  try {
    const { error } = await supabase.from('customers').upsert({
      id: customer.id,
      storeId: 'store-northline-01',
      name: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      loyaltyPoints: customer.loyaltyPoints,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      favoriteProduct: customer.favoriteProduct || null,
      notes: customer.notes || null,
      lastVisit: customer.lastVisit,
      createdAt: customer.createdAt,
      updatedAt: new Date().toISOString()
    });

    if (error) console.warn('Supabase sync customer warning:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to sync customer to Supabase:', err);
    return null;
  }
}
