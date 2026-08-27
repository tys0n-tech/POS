import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hplrcgegycrexyfzmuwu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Supabase sync helpers
export async function syncOrderToSupabase(orderData: {
  id: string;
  orderNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  orderType: string;
  tableOrPager?: string;
  notes?: string;
  staffName?: string;
}) {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase.from('orders').upsert({
      id: orderData.id,
      orderNumber: orderData.orderNumber,
      storeId: 'store-northline-01',
      registerId: 'REG-01',
      shiftId: 'shift-today-01',
      staffId: 'staff-1',
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      tax: orderData.tax,
      total: orderData.total,
      status: orderData.status,
      paymentStatus: orderData.paymentStatus,
      paymentMethod: orderData.paymentMethod || 'PROMPTPAY',
      orderType: orderData.orderType,
      tableOrPager: orderData.tableOrPager || null,
      notes: orderData.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (error) {
      console.warn('Supabase sync order error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to sync order to Supabase', err);
    return null;
  }
}

export async function syncInventoryTransactionToSupabase(txnData: {
  id: string;
  ingredientId: string;
  type: string;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  staffName: string;
}) {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase.from('inventory_transactions').upsert({
      id: txnData.id,
      ingredientId: txnData.ingredientId,
      userId: 'staff-1',
      type: txnData.type,
      quantityChange: txnData.quantityChange,
      quantityAfter: txnData.quantityAfter,
      reason: txnData.reason,
      createdAt: new Date().toISOString()
    });

    if (error) console.warn('Supabase sync inventory error:', error);
    return data;
  } catch (err) {
    console.error('Failed to sync inventory to Supabase', err);
    return null;
  }
}
