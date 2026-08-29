import { create } from 'zustand';
import { Table, TableStatus, TableZone } from '../types';
import { initialTables } from '../data/initialTables';

interface TableState {
  tables: Table[];
  selectedZone: TableZone | 'ALL';
  isTableModalOpen: boolean;
  
  // Actions
  setSelectedZone: (zone: TableZone | 'ALL') => void;
  setTableModalOpen: (open: boolean) => void;
  occupyTable: (tableId: string, orderNumber: string, amount: number, guestCount?: number) => void;
  releaseTable: (tableId: string) => void;
  releaseTableByOrderNumber: (orderNumber: string) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  transferTable: (fromTableId: string, toTableId: string) => { success: boolean; message?: string };
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
}

const STORAGE_KEY = 'northline_pos_tables';

const loadTables = (): Table[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialTables;
};

export const useTableStore = create<TableState>((set, get) => ({
  tables: loadTables(),
  selectedZone: 'ALL',
  isTableModalOpen: false,

  setSelectedZone: (zone) => set({ selectedZone: zone }),
  setTableModalOpen: (open) => set({ isTableModalOpen: open }),

  occupyTable: (tableId, orderNumber, amount, guestCount = 2) => {
    const updated = get().tables.map((tbl) =>
      tbl.id === tableId
        ? {
            ...tbl,
            status: 'OCCUPIED' as TableStatus,
            currentOrderNumber: orderNumber,
            currentBillAmount: amount,
            seatedAt: new Date().toISOString(),
            guestCount
          }
        : tbl
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tables: updated });
  },

  releaseTable: (tableId) => {
    const updated = get().tables.map((tbl) =>
      tbl.id === tableId
        ? {
            ...tbl,
            status: 'AVAILABLE' as TableStatus,
            currentOrderId: undefined,
            currentOrderNumber: undefined,
            currentBillAmount: undefined,
            seatedAt: undefined,
            guestCount: undefined
          }
        : tbl
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tables: updated });
  },

  releaseTableByOrderNumber: (orderNumber) => {
    if (!orderNumber) return;
    const cleanNumber = orderNumber.trim().toLowerCase();
    const updated = get().tables.map((tbl) => {
      if (
        tbl.currentOrderNumber?.trim().toLowerCase() === cleanNumber ||
        tbl.number.trim().toLowerCase() === cleanNumber ||
        tbl.name.trim().toLowerCase() === cleanNumber
      ) {
        return {
          ...tbl,
          status: 'AVAILABLE' as TableStatus,
          currentOrderId: undefined,
          currentOrderNumber: undefined,
          currentBillAmount: undefined,
          seatedAt: undefined,
          guestCount: undefined
        };
      }
      return tbl;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tables: updated });
  },

  updateTableStatus: (tableId, status) => {
    const updated = get().tables.map((tbl) =>
      tbl.id === tableId ? { ...tbl, status } : tbl
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tables: updated });
  },

  transferTable: (fromTableId, toTableId) => {
    const { tables } = get();
    const source = tables.find((t) => t.id === fromTableId);
    const target = tables.find((t) => t.id === toTableId);

    if (!source || !target) {
      return { success: false, message: 'Invalid table selection' };
    }
    if (target.status === 'OCCUPIED') {
      return { success: false, message: `${target.name} is currently occupied` };
    }

    const updated = tables.map((tbl) => {
      if (tbl.id === fromTableId) {
        return {
          ...tbl,
          status: 'AVAILABLE' as TableStatus,
          currentOrderNumber: undefined,
          currentBillAmount: undefined,
          seatedAt: undefined,
          guestCount: undefined
        };
      }
      if (tbl.id === toTableId) {
        return {
          ...tbl,
          status: 'OCCUPIED' as TableStatus,
          currentOrderNumber: source.currentOrderNumber,
          currentBillAmount: source.currentBillAmount,
          seatedAt: source.seatedAt || new Date().toISOString(),
          guestCount: source.guestCount
        };
      }
      return tbl;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tables: updated });
    return { success: true };
  },

  addTable: (newTable) => {
    const table: Table = {
      ...newTable,
      id: `tbl-${Date.now()}`
    };
    const updated = [...get().tables, table];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tables: updated });
  },

  updateTable: (id, updates) => {
    const updated = get().tables.map((t) => (t.id === id ? { ...t, ...updates } : t));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tables: updated });
  },

  deleteTable: (id) => {
    const updated = get().tables.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ tables: updated });
  }
}));
