import React, { useState } from 'react';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useStaffStore } from '../stores/useStaffStore';
import { useToastStore } from '../stores/useToastStore';
import { Ingredient, InventoryTransaction } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { formatCurrency, formatDateTime, cn } from '../utils/format';
import { sound } from '../utils/audio';
import { 
  Boxes, 
  Plus, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle, 
  History, 
  Scale, 
  Layers,
  Edit2
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const {
    ingredients,
    transactions,
    addIngredient,
    updateIngredient,
    addTransaction
  } = useInventoryStore();

  const { currentStaff } = useStaffStore();
  const { showToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<'STOCK' | 'LOGS'>('STOCK');
  const [search, setSearch] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTE'>('PURCHASE');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Add Ingredient Modal
  const [isAddIngModalOpen, setIsAddIngModalOpen] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngStock, setNewIngStock] = useState('1000');
  const [newIngUnit, setNewIngUnit] = useState<Ingredient['unit']>('g');
  const [newIngMin, setNewIngMin] = useState('200');
  const [newIngCost, setNewIngCost] = useState('0.5');

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = ingredients.filter((i) => i.currentStock <= i.minimumStock).length;

  const handleOpenAdjust = (ing: Ingredient) => {
    sound.playClick();
    setSelectedIngredient(ing);
    setAdjustType('PURCHASE');
    setAdjustQty('1000');
    setAdjustReason('Roastery Delivery / Stock In');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    const qty = parseFloat(adjustQty) || 0;
    const delta = adjustType === 'PURCHASE' || adjustType === 'ADJUSTMENT' ? qty : -qty;

    addTransaction(
      selectedIngredient.id,
      adjustType,
      delta,
      adjustReason || `${adjustType} recorded`,
      currentStaff.name
    );

    sound.playSuccess();
    showToast({
      type: 'success',
      title: 'Stock Updated',
      message: `${selectedIngredient.name} (${delta > 0 ? '+' : ''}${delta} ${selectedIngredient.unit})`
    });

    setIsAdjustModalOpen(false);
  };

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    addIngredient({
      name: newIngName.trim(),
      currentStock: parseFloat(newIngStock) || 0,
      unit: newIngUnit,
      minimumStock: parseFloat(newIngMin) || 0,
      costPerUnit: parseFloat(newIngCost) || 0
    });

    sound.playSuccess();
    showToast({ type: 'success', title: 'Ingredient Added', message: newIngName });
    setIsAddIngModalOpen(false);
    setNewIngName('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Inventory & Stock Control
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Live ingredient tracking, automated consumption from recipes & audit logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Low stock pill indicator */}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#FF9F0A]/15 text-[#C97B00] dark:text-[#FF9F0A] text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowStockCount} Low Stock Items</span>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddIngModalOpen(true)}
          >
            Add Ingredient
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-[12px]">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('STOCK');
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all',
              activeTab === 'STOCK'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                : 'text-[#6E6E73] dark:text-[#98989D]'
            )}
          >
            Current Stock ({ingredients.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('LOGS');
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all flex items-center gap-1.5',
              activeTab === 'LOGS'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                : 'text-[#6E6E73] dark:text-[#98989D]'
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({transactions.length})</span>
          </button>
        </div>

        <div className="w-64">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search ingredients..."
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'STOCK' ? (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#98989D] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Ingredient</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Minimum Threshold</th>
                  <th className="py-3.5 px-4">Unit Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Stock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {filteredIngredients.map((ing) => {
                  const isLow = ing.currentStock <= ing.minimumStock;
                  return (
                    <tr
                      key={ing.id}
                      className="h-16 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3 px-5 font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {ing.name}
                      </td>
                      <td className="py-3 px-4 font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {ing.currentStock.toLocaleString()} {ing.unit}
                      </td>
                      <td className="py-3 px-4 text-[#6E6E73] dark:text-[#98989D]">
                        {ing.minimumStock.toLocaleString()} {ing.unit}
                      </td>
                      <td className="py-3 px-4 text-[#6E6E73] dark:text-[#98989D]">
                        {formatCurrency(ing.costPerUnit, { decimals: true })} / {ing.unit}
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <Badge variant="warning" dot>
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success" dot>
                            Normal
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenAdjust(ing)}
                          leftIcon={<Scale className="w-3.5 h-3.5" />}
                        >
                          Adjust / In
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Audit Logs Table */
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#98989D] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-4">Ingredient</th>
                  <th className="py-3.5 px-4">Action Type</th>
                  <th className="py-3.5 px-4">Change</th>
                  <th className="py-3.5 px-4">Stock After</th>
                  <th className="py-3.5 px-4">Reason / Order</th>
                  <th className="py-3.5 px-4">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="h-14 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3 px-5 text-[#6E6E73] dark:text-[#98989D]">
                      {formatDateTime(txn.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {txn.ingredientName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[11px] uppercase tracking-wider text-[#6E6E73]">
                        {txn.type}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 font-bold ${
                        txn.quantityChange > 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'
                      }`}
                    >
                      {txn.quantityChange > 0 ? '+' : ''}
                      {txn.quantityChange.toLocaleString()} {txn.unit}
                    </td>
                    <td className="py-3 px-4 text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {txn.quantityAfter.toLocaleString()} {txn.unit}
                    </td>
                    <td className="py-3 px-4 text-[#6E6E73] dark:text-[#98989D]">
                      {txn.reason}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {txn.staffName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {selectedIngredient && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Stock: ${selectedIngredient.name}`}
          subtitle={`Current Level: ${selectedIngredient.currentStock} ${selectedIngredient.unit}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveAdjustment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-1.5">
                Adjustment Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAdjustType(type)}
                    className={cn(
                      'py-2 px-1 text-center text-xs font-semibold rounded-[10px] border transition-all',
                      adjustType === type
                        ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] text-[#1D1D1F] dark:text-white ring-1 ring-[#8B6F5A]'
                        : 'bg-black/[0.02] border-black/10 text-[#6E6E73]'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label={`Quantity to change (${selectedIngredient.unit}) *`}
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="e.g. 1000"
              required
            />

            <Input
              label="Reason or Invoice Reference *"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Weekly roastery delivery / bar spill"
              required
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setIsAdjustModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Save Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Ingredient Modal */}
      <Modal
        isOpen={isAddIngModalOpen}
        onClose={() => setIsAddIngModalOpen(false)}
        title="Add New Raw Ingredient"
        maxWidth="md"
      >
        <form onSubmit={handleCreateIngredient} className="space-y-4">
          <Input
            label="Ingredient Name *"
            value={newIngName}
            onChange={(e) => setNewIngName(e.target.value)}
            placeholder="e.g. Colombia Geisha Beans"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Starting Stock Level *"
              type="number"
              value={newIngStock}
              onChange={(e) => setNewIngStock(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-1.5">
                Unit of Measure
              </label>
              <select
                value={newIngUnit}
                onChange={(e) => setNewIngUnit(e.target.value as Ingredient['unit'])}
                className="w-full bg-[#FFFFFF] dark:bg-[#1C1C1E] text-sm rounded-[12px] border border-black/10 dark:border-white/10 px-3 py-2.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
              >
                <option value="g">Grams (g)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="L">Liters (L)</option>
                <option value="shots">Shots</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minimum Stock Warning Alert"
              type="number"
              value={newIngMin}
              onChange={(e) => setNewIngMin(e.target.value)}
            />
            <Input
              label="Cost per Unit (THB)"
              type="number"
              step="0.01"
              value={newIngCost}
              onChange={(e) => setNewIngCost(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsAddIngModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Add Ingredient
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
