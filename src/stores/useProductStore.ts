import { create } from 'zustand';
import { Category, ModifierGroup, Product } from '../types';
import { initialModifierGroups, initialProducts } from '../data/initialData';

interface ProductState {
  products: Product[];
  modifierGroups: ModifierGroup[];
  selectedCategory: Category;
  searchQuery: string;
  customizingProduct: Product | null;
  customizingProductRect: DOMRect | null;
  setSelectedCategory: (cat: Category) => void;
  setSearchQuery: (query: string) => void;
  setCustomizingProduct: (product: Product | null, rect?: DOMRect | null) => void;
  findProductByBarcode: (barcode: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'soldCount'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;
  addModifierGroup: (group: Omit<ModifierGroup, 'id'>) => void;
  updateModifierGroup: (id: string, updates: Partial<ModifierGroup>) => void;
}

const STORAGE_KEY_PROD = 'northline_pos_products';
const STORAGE_KEY_MOD = 'northline_pos_modifier_groups';

const loadProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROD);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialProducts;
};

const loadModifierGroups = (): ModifierGroup[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MOD);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialModifierGroups;
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: loadProducts(),
  modifierGroups: loadModifierGroups(),
  selectedCategory: 'All',
  searchQuery: '',
  customizingProduct: null,
  customizingProductRect: null,

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCustomizingProduct: (customizingProduct, rect = null) => 
    set({ customizingProduct, customizingProductRect: rect }),

  findProductByBarcode: (barcode) => {
    const clean = barcode.trim().toLowerCase();
    return get().products.find(
      (p) => p.barcode.toLowerCase() === clean || p.sku.toLowerCase() === clean
    );
  },

  addProduct: (newProd) => {
    const product: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      soldCount: 0
    };
    const updated = [product, ...get().products];
    localStorage.setItem(STORAGE_KEY_PROD, JSON.stringify(updated));
    set({ products: updated });
  },

  updateProduct: (id, updates) => {
    const updated = get().products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(STORAGE_KEY_PROD, JSON.stringify(updated));
    set({ products: updated });
  },

  deleteProduct: (id) => {
    const updated = get().products.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PROD, JSON.stringify(updated));
    set({ products: updated });
  },

  toggleProductAvailability: (id) => {
    const updated = get().products.map((p) => (p.id === id ? { ...p, available: !p.available } : p));
    localStorage.setItem(STORAGE_KEY_PROD, JSON.stringify(updated));
    set({ products: updated });
  },

  addModifierGroup: (newGroup) => {
    const group: ModifierGroup = {
      ...newGroup,
      id: `mg-${Date.now()}`
    };
    const updated = [...get().modifierGroups, group];
    localStorage.setItem(STORAGE_KEY_MOD, JSON.stringify(updated));
    set({ modifierGroups: updated });
  },

  updateModifierGroup: (id, updates) => {
    const updated = get().modifierGroups.map((g) => (g.id === id ? { ...g, ...updates } : g));
    localStorage.setItem(STORAGE_KEY_MOD, JSON.stringify(updated));
    set({ modifierGroups: updated });
  }
}));
