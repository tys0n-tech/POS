import { create } from 'zustand';
import { Ingredient, InventoryTransaction, RecipeItem } from '../types';
import { initialIngredients, initialInventoryTransactions } from '../data/initialData';
import { syncInventoryTransactionToSupabase } from '../utils/supabase';

interface InventoryState {
  ingredients: Ingredient[];
  transactions: InventoryTransaction[];
  deductRecipeItems: (recipeItems: RecipeItem[], orderId: string, staffName: string) => void;
  restockRecipeItems: (recipeItems: RecipeItem[], orderId: string, staffName: string, reason?: string) => void;
  addTransaction: (
    ingredientId: string,
    type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTE',
    quantityChange: number,
    reason: string,
    staffName: string
  ) => void;
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'updatedAt'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  getLowStockItems: () => Ingredient[];
}

const STORAGE_KEY_ING = 'northline_pos_ingredients';
const STORAGE_KEY_TXN = 'northline_pos_inventory_txns';

const loadIngredients = (): Ingredient[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ING);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialIngredients;
};

const loadTransactions = (): InventoryTransaction[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TXN);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialInventoryTransactions;
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ingredients: loadIngredients(),
  transactions: loadTransactions(),

  deductRecipeItems: (recipeItems, orderId, staffName) => {
    let updatedIngredients = [...get().ingredients];
    const newTransactions: InventoryTransaction[] = [];
    const now = new Date().toISOString();

    recipeItems.forEach((recipe) => {
      const idx = updatedIngredients.findIndex((i) => i.id === recipe.ingredientId);
      if (idx !== -1) {
        const item = updatedIngredients[idx];
        const newStock = Math.max(0, item.currentStock - recipe.quantity);
        updatedIngredients[idx] = {
          ...item,
          currentStock: newStock,
          updatedAt: now
        };

        newTransactions.push({
          id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          ingredientId: item.id,
          ingredientName: item.name,
          type: 'USAGE',
          quantityChange: -recipe.quantity,
          quantityAfter: newStock,
          unit: item.unit,
          reason: `Auto deduction for order ${orderId}`,
          staffName,
          orderId,
          timestamp: now
        });
      }
    });

    const allTxns = [...newTransactions, ...get().transactions];
    localStorage.setItem(STORAGE_KEY_ING, JSON.stringify(updatedIngredients));
    localStorage.setItem(STORAGE_KEY_TXN, JSON.stringify(allTxns));

    set({
      ingredients: updatedIngredients,
      transactions: allTxns
    });
  },

  restockRecipeItems: (recipeItems, orderId, staffName, reason = 'Order Refund Stock Return') => {
    let updatedIngredients = [...get().ingredients];
    const newTransactions: InventoryTransaction[] = [];
    const now = new Date().toISOString();

    recipeItems.forEach((recipe) => {
      const idx = updatedIngredients.findIndex((i) => i.id === recipe.ingredientId);
      if (idx !== -1) {
        const item = updatedIngredients[idx];
        const newStock = item.currentStock + recipe.quantity;
        updatedIngredients[idx] = {
          ...item,
          currentStock: newStock,
          updatedAt: now
        };

        newTransactions.push({
          id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          ingredientId: item.id,
          ingredientName: item.name,
          type: 'ADJUSTMENT',
          quantityChange: recipe.quantity,
          quantityAfter: newStock,
          unit: item.unit,
          reason: `${reason} (${orderId})`,
          staffName,
          orderId,
          timestamp: now
        });
      }
    });

    const allTxns = [...newTransactions, ...get().transactions];
    localStorage.setItem(STORAGE_KEY_ING, JSON.stringify(updatedIngredients));
    localStorage.setItem(STORAGE_KEY_TXN, JSON.stringify(allTxns));

    set({
      ingredients: updatedIngredients,
      transactions: allTxns
    });
  },

  addTransaction: (ingredientId, type, quantityChange, reason, staffName) => {
    const { ingredients, transactions } = get();
    const idx = ingredients.findIndex((i) => i.id === ingredientId);
    if (idx === -1) return;

    const item = ingredients[idx];
    const newStock = Math.max(0, item.currentStock + quantityChange);
    const now = new Date().toISOString();

    const updatedItem = {
      ...item,
      currentStock: newStock,
      updatedAt: now
    };

    const updatedIngredients = [...ingredients];
    updatedIngredients[idx] = updatedItem;

    const newTxn: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      ingredientId: item.id,
      ingredientName: item.name,
      type,
      quantityChange,
      quantityAfter: newStock,
      unit: item.unit,
      reason,
      staffName,
      timestamp: now
    };

    const allTxns = [newTxn, ...transactions];
    localStorage.setItem(STORAGE_KEY_ING, JSON.stringify(updatedIngredients));
    localStorage.setItem(STORAGE_KEY_TXN, JSON.stringify(allTxns));

    // Live sync to Supabase Cloud
    syncInventoryTransactionToSupabase(newTxn);

    set({
      ingredients: updatedIngredients,
      transactions: allTxns
    });
  },

  addIngredient: (ingredientData) => {
    const newIng: Ingredient = {
      ...ingredientData,
      id: `ing-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const updated = [...get().ingredients, newIng];
    localStorage.setItem(STORAGE_KEY_ING, JSON.stringify(updated));
    set({ ingredients: updated });
  },

  updateIngredient: (id, updates) => {
    const updated = get().ingredients.map((ing) =>
      ing.id === id ? { ...ing, ...updates, updatedAt: new Date().toISOString() } : ing
    );
    localStorage.setItem(STORAGE_KEY_ING, JSON.stringify(updated));
    set({ ingredients: updated });
  },

  deleteIngredient: (id) => {
    const updated = get().ingredients.filter((ing) => ing.id !== id);
    localStorage.setItem(STORAGE_KEY_ING, JSON.stringify(updated));
    set({ ingredients: updated });
  },

  getLowStockItems: () => {
    return get().ingredients.filter((ing) => ing.currentStock <= ing.minimumStock);
  }
}));
