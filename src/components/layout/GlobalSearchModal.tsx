import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { useProductStore } from '../../stores/useProductStore';
import { useOrderStore } from '../../stores/useOrderStore';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { useCartStore } from '../../stores/useCartStore';
import { useToastStore } from '../../stores/useToastStore';
import { formatCurrency, formatPhone } from '../../utils/format';
import { Search, Package, ShoppingBag, Users, Barcode, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { products, setCustomizingProduct } = useProductStore();
  const { orders, setSelectedOrder } = useOrderStore();
  const { customers, setSelectedCustomer } = useCustomerStore();
  const { addItem } = useCartStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const cleanQuery = query.trim().toLowerCase();

  // Search Results
  const matchedProducts = cleanQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          p.category.toLowerCase().includes(cleanQuery) ||
          p.sku.toLowerCase().includes(cleanQuery) ||
          p.barcode.includes(cleanQuery)
      )
    : [];

  const matchedOrders = cleanQuery
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(cleanQuery) ||
          (o.customer?.name && o.customer.name.toLowerCase().includes(cleanQuery)) ||
          (o.customer?.phone && o.customer.phone.includes(cleanQuery))
      )
    : [];

  const matchedCustomers = cleanQuery
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.phone.replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, ''))
      )
    : [];

  const totalResults = matchedProducts.length + matchedOrders.length + matchedCustomers.length;

  const handleSelectProduct = (product: typeof products[0]) => {
    sound.playClick();
    onClose();
    if (product.modifierGroupIds && product.modifierGroupIds.length > 0) {
      setCustomizingProduct(product);
      onNavigateTab('pos');
    } else {
      addItem(product, []);
      onNavigateTab('pos');
      showToast({ type: 'success', title: 'Added to Cart', message: product.name });
    }
  };

  const handleSelectOrder = (order: typeof orders[0]) => {
    sound.playClick();
    setSelectedOrder(order);
    onNavigateTab('orders');
    onClose();
  };

  const handleSelectCustomer = (customer: typeof customers[0]) => {
    sound.playClick();
    setSelectedCustomer(customer);
    onNavigateTab('customers');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      maxWidth="lg"
      className="p-0 overflow-hidden"
    >
      {/* Search Input Bar */}
      <div className="flex items-center px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] gap-3">
        <Search className="w-5 h-5 text-[#8B6F5A] dark:text-[#D4BBA5] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, orders, customers, or SKU..."
          className="w-full bg-transparent text-base text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#6E6E73]/60 dark:placeholder:text-[#98989D]/60 focus:outline-none"
        />
        <kbd className="px-2 py-1 rounded bg-black/[0.06] dark:bg-white/[0.1] text-[11px] font-mono text-[#6E6E73] dark:text-[#98989D]">
          ESC
        </kbd>
      </div>

      {/* Results List */}
      <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
        {!cleanQuery ? (
          <div className="py-8 text-center text-xs text-[#6E6E73] dark:text-[#98989D]">
            Type to search across the entire catalog, customers, and order history...
          </div>
        ) : totalResults === 0 ? (
          <div className="py-8 text-center text-xs text-[#6E6E73] dark:text-[#98989D]">
            No results found for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <>
            {/* Products */}
            {matchedProducts.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  <Package className="w-3 h-3 text-[#8B6F5A]" />
                  <span>Products ({matchedProducts.length})</span>
                </div>
                {matchedProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="w-full flex items-center justify-between p-2 rounded-[12px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-[8px] object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                          {p.category} · SKU: {p.sku}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {formatCurrency(p.basePrice)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#6E6E73] dark:text-[#98989D]" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Orders */}
            {matchedOrders.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  <ShoppingBag className="w-3 h-3 text-[#0071E3]" />
                  <span>Orders ({matchedOrders.length})</span>
                </div>
                {matchedOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleSelectOrder(o)}
                    className="w-full flex items-center justify-between p-2 rounded-[12px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-left transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {o.orderNumber} · {o.customer ? o.customer.name : 'Walk-in'}
                      </p>
                      <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                        {o.items.length} items · Status: {o.status}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {formatCurrency(o.total)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Customers */}
            {matchedCustomers.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  <Users className="w-3 h-3 text-[#34C759]" />
                  <span>Customers ({matchedCustomers.length})</span>
                </div>
                {matchedCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="w-full flex items-center justify-between p-2 rounded-[12px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-left transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                        {formatPhone(c.phone)} · {c.loyaltyPoints} points
                      </p>
                    </div>
                    <span className="text-xs text-[#6E6E73] dark:text-[#98989D]">
                      {c.totalOrders} visits
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
