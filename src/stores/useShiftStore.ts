import { create } from 'zustand';
import { Shift, ShiftCashEntry } from '../types';
import { initialShift } from '../data/initialData';
import { syncShiftToSupabase } from '../utils/supabase';

interface ShiftState {
  currentShift: Shift | null;
  shiftHistory: Shift[];
  isShiftDrawerOpen: boolean;
  setShiftDrawerOpen: (open: boolean) => void;
  openShift: (staffId: string, staffName: string, startingCash: number) => void;
  recordSale: (amount: number, isCash: boolean) => void;
  recordRefund: (amount: number, isCash: boolean) => void;
  addCashEntry: (type: 'CASH_IN' | 'CASH_OUT', amount: number, reason: string, staffName: string) => void;
  closeShift: (actualCash: number, note?: string) => { shift: Shift; difference: number };
}

const STORAGE_KEY_CURRENT = 'northline_pos_current_shift';
const STORAGE_KEY_HISTORY = 'northline_pos_shift_history';

const loadCurrentShift = (): Shift | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialShift;
};

const loadHistory = (): Shift[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: loadCurrentShift(),
  shiftHistory: loadHistory(),
  isShiftDrawerOpen: false,
  setShiftDrawerOpen: (open) => set({ isShiftDrawerOpen: open }),

  openShift: (staffId, staffName, startingCash) => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      staffId,
      staffName,
      registerName: 'Main Terminal (Counter 1)',
      startTime: new Date().toISOString(),
      status: 'OPEN',
      startingCash,
      cashSales: 0,
      digitalSales: 0,
      cashRefunds: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: startingCash,
      cashEntries: [
        {
          id: `entry-${Date.now()}`,
          type: 'CASH_IN',
          amount: startingCash,
          reason: 'Opening Float Cash',
          timestamp: new Date().toISOString(),
          staffName
        }
      ]
    };
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(newShift));
    set({ currentShift: newShift, isShiftDrawerOpen: false });

    // Sync to Supabase
    syncShiftToSupabase(newShift);
  },

  recordSale: (amount, isCash) => {
    const { currentShift } = get();
    if (!currentShift || currentShift.status !== 'OPEN') return;

    const cashSales = isCash ? currentShift.cashSales + amount : currentShift.cashSales;
    const digitalSales = !isCash ? currentShift.digitalSales + amount : currentShift.digitalSales;
    const expectedCash = currentShift.startingCash + cashSales + currentShift.cashIn - currentShift.cashOut - currentShift.cashRefunds;

    const updated: Shift = {
      ...currentShift,
      cashSales,
      digitalSales,
      expectedCash
    };

    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(updated));
    set({ currentShift: updated });

    syncShiftToSupabase(updated);
  },

  recordRefund: (amount, isCash) => {
    const { currentShift } = get();
    if (!currentShift || currentShift.status !== 'OPEN') return;

    const cashRefunds = isCash ? currentShift.cashRefunds + amount : currentShift.cashRefunds;
    const expectedCash = currentShift.startingCash + currentShift.cashSales + currentShift.cashIn - currentShift.cashOut - cashRefunds;

    const updated: Shift = {
      ...currentShift,
      cashRefunds,
      expectedCash
    };

    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(updated));
    set({ currentShift: updated });

    syncShiftToSupabase(updated);
  },

  addCashEntry: (type, amount, reason, staffName) => {
    const { currentShift } = get();
    if (!currentShift || currentShift.status !== 'OPEN') return;

    const entry: ShiftCashEntry = {
      id: `entry-${Date.now()}`,
      type,
      amount,
      reason,
      timestamp: new Date().toISOString(),
      staffName
    };

    const cashIn = type === 'CASH_IN' ? currentShift.cashIn + amount : currentShift.cashIn;
    const cashOut = type === 'CASH_OUT' ? currentShift.cashOut + amount : currentShift.cashOut;
    const expectedCash = currentShift.startingCash + currentShift.cashSales + cashIn - cashOut - currentShift.cashRefunds;

    const updated: Shift = {
      ...currentShift,
      cashIn,
      cashOut,
      expectedCash,
      cashEntries: [...currentShift.cashEntries, entry]
    };

    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(updated));
    set({ currentShift: updated });

    syncShiftToSupabase(updated);
  },

  closeShift: (actualCash, note) => {
    const { currentShift, shiftHistory } = get();
    if (!currentShift) {
      throw new Error('No active shift to close');
    }

    const difference = actualCash - currentShift.expectedCash;
    const closedShift: Shift = {
      ...currentShift,
      status: 'CLOSED',
      endTime: new Date().toISOString(),
      actualCash,
      difference,
      note
    };

    const newHistory = [closedShift, ...shiftHistory];
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    localStorage.removeItem(STORAGE_KEY_CURRENT);

    set({
      currentShift: null,
      shiftHistory: newHistory,
      isShiftDrawerOpen: false
    });

    syncShiftToSupabase(closedShift);

    return { shift: closedShift, difference };
  }
}));
