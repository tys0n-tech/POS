import React, { useState } from 'react';
import { useProductStore } from '../stores/useProductStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useToastStore } from '../stores/useToastStore';
import { Product, Category, RecipeItem } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { formatCurrency, cn } from '../utils/format';
import { sound } from '../utils/audio';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Layers, 
  Sliders,
  DollarSign
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const {
    products,
    modifierGroups,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability
  } = useProductStore();

  const { ingredients } = useInventoryStore();
  const { showToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Coffee');
  const [basePrice, setBasePrice] = useState('85');
  const [costPrice, setCostPrice] = useState('28');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [image, setImage] = useState('');
  const [selectedModifierGroupIds, setSelectedModifierGroupIds] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);

  const categories: Category[] = [
    'All',
    'Coffee',
    'Tea',
    'Matcha',
    'Non-Coffee',
    'Bakery',
    'Dessert',
    'Seasonal'
  ];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    return matchesCat && matchesSearch;
  });

  const handleOpenCreate = () => {
    sound.playClick();
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('Coffee');
    setBasePrice('85');
    setCostPrice('28');
    setSku(`COF-${Math.floor(100 + Math.random() * 900)}`);
    setBarcode(`885100${Math.floor(1000 + Math.random() * 9000)}`);
    setImage('https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80');
    setSelectedModifierGroupIds(['mg-size', 'mg-milk', 'mg-sweetness', 'mg-ice']);
    setRecipe([
      { ingredientId: 'ing-espresso', ingredientName: 'Coffee Beans', quantity: 18, unit: 'g' },
      { ingredientId: 'ing-milk-fresh', ingredientName: 'Fresh Milk', quantity: 180, unit: 'ml' }
    ]);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    sound.playClick();
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category);
    setBasePrice(p.basePrice.toString());
    setCostPrice(p.costPrice.toString());
    setSku(p.sku);
    setBarcode(p.barcode);
    setImage(p.image);
    setSelectedModifierGroupIds(p.modifierGroupIds || []);
    setRecipe(p.recipe || []);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedBase = parseFloat(basePrice) || 0;
    const parsedCost = parseFloat(costPrice) || 0;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        description,
        category,
        basePrice: parsedBase,
        costPrice: parsedCost,
        sku,
        barcode,
        image,
        modifierGroupIds: selectedModifierGroupIds,
        recipe
      });
      showToast({ type: 'success', title: 'Product Updated', message: name });
    } else {
      addProduct({
        name,
        description,
        category,
        basePrice: parsedBase,
        costPrice: parsedCost,
        sku,
        barcode,
        image,
        available: true,
        modifierGroupIds: selectedModifierGroupIds,
        recipe
      });
      showToast({ type: 'success', title: 'Product Created', message: name });
    }

    sound.playSuccess();
    setIsEditModalOpen(false);
  };

  const toggleModifierGroup = (groupId: string) => {
    sound.playClick();
    setSelectedModifierGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleAddRecipeIngredient = (ingredientId: string) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;
    if (recipe.some((r) => r.ingredientId === ingredientId)) return;

    setRecipe([...recipe, { ingredientId: ing.id, ingredientName: ing.name, quantity: 10, unit: ing.unit }]);
  };

  const handleUpdateRecipeQuantity = (ingredientId: string, qty: number) => {
    setRecipe(recipe.map((r) => (r.ingredientId === ingredientId ? { ...r, quantity: qty } : r)));
  };

  const handleRemoveRecipeIngredient = (ingredientId: string) => {
    setRecipe(recipe.filter((r) => r.ingredientId !== ingredientId));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Product Catalog
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Manage beverages, bakery items, prices, modifiers and recipes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-56">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search products..."
            />
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-4 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3.5 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all',
              selectedCategory === cat
                ? 'bg-[#1D1D1F] text-white dark:bg-[#F5F5F7] dark:text-[#1D1D1F]'
                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="flex-1 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#98989D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">SKU / Barcode</th>
                <th className="py-3.5 px-4">Price / Cost</th>
                <th className="py-3.5 px-4">Modifiers</th>
                <th className="py-3.5 px-4">Recipe Link</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filtered.map((prod) => (
                <tr
                  key={prod.id}
                  className="h-16 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-10 h-10 rounded-[10px] object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D] line-clamp-1 max-w-[200px]">
                          {prod.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#6E6E73] dark:text-[#98989D]">
                    {prod.category}
                  </td>
                  <td className="py-3 px-4 text-[#6E6E73] dark:text-[#98989D] font-mono text-[11px]">
                    <div>{prod.sku}</div>
                    <div className="text-[10px] opacity-70">{prod.barcode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {formatCurrency(prod.basePrice)}
                    </div>
                    <div className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                      Cost: {formatCurrency(prod.costPrice)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D]">
                      {prod.modifierGroupIds?.length || 0} groups
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D]">
                      {prod.recipe?.length || 0} ingredients
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleProductAvailability(prod.id)}
                      className={cn(
                        'px-2.5 py-1 rounded-[8px] text-[11px] font-semibold transition-all',
                        prod.available
                          ? 'bg-[#34C759]/15 text-[#248A3D] dark:text-[#30D158]'
                          : 'bg-black/10 text-[#6E6E73] dark:bg-white/10 dark:text-[#98989D]'
                      )}
                    >
                      {prod.available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-[8px] hover:bg-black/[0.04] text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteProduct(prod.id);
                        showToast({ type: 'warning', title: 'Product Deleted', message: prod.name });
                      }}
                      className="p-1.5 rounded-[8px] hover:bg-black/[0.04] text-[#6E6E73] hover:text-[#FF3B30]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Create New Product'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Product Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dirty Coffee"
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-[#FFFFFF] dark:bg-[#1C1C1E] text-sm rounded-[12px] border border-black/10 dark:border-white/10 px-3 py-2.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Single origin cold brew with tonic"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Retail Selling Price (THB) *"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="85"
              required
            />
            <Input
              label="Cost of Goods (THB)"
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="28"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="COF-LAT-01"
            />
            <Input
              label="Barcode / Scanner Code"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="8851001001"
            />
          </div>

          <Input
            label="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />

          {/* Modifier Groups Assigner */}
          <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
            <label className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
              Attach Modifier Groups
            </label>
            <div className="flex flex-wrap gap-2">
              {modifierGroups.map((g) => {
                const isSelected = selectedModifierGroupIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleModifierGroup(g.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all flex items-center gap-1.5',
                      isSelected
                        ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] text-[#1D1D1F] dark:text-white font-semibold'
                        : 'bg-black/[0.02] border-black/10 text-[#6E6E73]'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#8B6F5A]" />}
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipe Stock Auto-Deduction Linker */}
          <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                Recipe / Auto Inventory Deduction
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddRecipeIngredient(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-xs bg-black/[0.04] dark:bg-white/[0.08] px-2.5 py-1 rounded-[8px] border-none"
              >
                <option value="">+ Add Ingredient</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {recipe.map((r) => (
                <div
                  key={r.ingredientId}
                  className="flex items-center justify-between p-2 rounded-[8px] bg-black/[0.02] dark:bg-white/[0.03] text-xs"
                >
                  <span className="font-medium">{r.ingredientName}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={r.quantity}
                      onChange={(e) =>
                        handleUpdateRecipeQuantity(r.ingredientId, parseFloat(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-0.5 rounded bg-white dark:bg-[#2C2C2E] border border-black/10 text-right font-semibold"
                    />
                    <span className="text-[11px] text-[#6E6E73] w-8">{r.unit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipeIngredient(r.ingredientId)}
                      className="text-[#FF3B30] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
