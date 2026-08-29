import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Category, Product, OrderItemModifier } from '../types';
import { useProductStore } from '../stores/useProductStore';
import { useCartStore } from '../stores/useCartStore';
import { useToastStore } from '../stores/useToastStore';
import { useTranslation } from '../hooks/useTranslation';
import { ProductCard } from '../components/pos/ProductCard';
import { ProductCustomizerModal } from '../components/pos/ProductCustomizerModal';
import { OrderPanel } from '../components/pos/OrderPanel';
import { PaymentModal } from '../components/pos/PaymentModal';
import { SearchInput } from '../components/ui/SearchInput';
import { sound } from '../utils/audio';
import { 
  Coffee, 
  ShoppingBag, 
  ChevronRight
} from 'lucide-react';
import { cn, formatCurrency } from '../utils/format';

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.02
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: 'easeOut' }
  }
};

export const POSPage: React.FC = () => {
  const {
    products,
    modifierGroups,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    customizingProduct,
    setCustomizingProduct,
    findProductByBarcode
  } = useProductStore();

  const { addItem, getItemCount, getTotal } = useCartStore();
  const { showToast } = useToastStore();
  const { t } = useTranslation();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState('');

  const categories: { id: Category; key: string }[] = [
    { id: 'All', key: 'categories.all' },
    { id: 'Coffee', key: 'categories.coffee' },
    { id: 'Tea', key: 'categories.tea' },
    { id: 'Matcha', key: 'categories.matcha' },
    { id: 'Non-Coffee', key: 'categories.nonCoffee' },
    { id: 'Bakery', key: 'categories.bakery' },
    { id: 'Dessert', key: 'categories.dessert' },
    { id: 'Seasonal', key: 'categories.seasonal' }
  ];

  // Barcode scanner listener
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          const matched = findProductByBarcode(barcodeBuffer);
          if (matched) {
            sound.playBarcodeBeep();
            if (matched.modifierGroupIds && matched.modifierGroupIds.length > 0) {
              setCustomizingProduct(matched);
            } else {
              addItem(matched, []);
              showToast({ type: 'success', title: 'Barcode Scanned', message: `Added ${matched.name}` });
            }
          } else {
            sound.playError();
            showToast({ type: 'warning', title: 'Product Not Found', message: `Barcode: ${barcodeBuffer}` });
          }
          setBarcodeBuffer('');
        }
      } else if (e.key.length === 1) {
        setBarcodeBuffer((prev) => prev + e.key);
        clearTimeout(timeout);
        timeout = setTimeout(() => setBarcodeBuffer(''), 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [barcodeBuffer, findProductByBarcode, addItem, setCustomizingProduct, showToast]);

  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.barcode.includes(searchQuery);

    return matchesCat && matchesSearch;
  });

  const handleProductCardClick = (product: Product, rect?: DOMRect) => {
    if (product.modifierGroupIds && product.modifierGroupIds.length > 0) {
      setCustomizingProduct(product, rect);
    } else {
      addItem(product, []);
      showToast({ type: 'success', title: 'Added to Cart', message: product.name, duration: 1500 });
    }
  };

  const handleAddCustomizedToCart = (
    product: Product,
    selectedModifiers: OrderItemModifier[],
    quantity: number,
    notes: string
  ) => {
    addItem(product, selectedModifiers, quantity, notes);
    showToast({
      type: 'success',
      title: 'Item Added',
      message: `${quantity}x ${product.name}`,
      duration: 1500
    });
  };

  const itemCount = getItemCount();

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* LEFT ZONE: Menu & Products */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6">
        {/* Filter Bar: Apple-style Segmented Control with Gliding Capsule Indicator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 shrink-0">
          {/* Categories Segmented Control */}
          <div className="relative flex items-center gap-1 overflow-x-auto p-1 rounded-[14px] bg-black/[0.05] dark:bg-white/[0.08] no-scrollbar shrink-0 shadow-inner">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={cn(
                    'relative z-10 px-4 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-colors duration-200 select-none',
                    isSelected
                      ? 'text-[#1D1D1F] dark:text-[#FFFFFF]'
                      : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="absolute inset-0 bg-white dark:bg-[#1C1C1E] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-[-1]"
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 35,
                        mass: 0.6
                      }}
                    />
                  )}
                  <span>{t(cat.key)}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64 shrink-0">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder={t('pos.searchPlaceholder')}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
              <Coffee className="w-8 h-8 text-[#6E6E73] opacity-40" />
              <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                No items found
              </p>
              <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
                {t('pos.searchPlaceholder')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-16 lg:pb-0">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductCardClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT ZONE: Desktop Order Summary Ticket Panel */}
      <div className="hidden lg:flex w-[360px] xl:w-[380px] shrink-0 h-full">
        <OrderPanel onProceedToPayment={() => setIsPaymentModalOpen(true)} />
      </div>

      {/* Mobile Floating Cart Button */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="lg:hidden fixed bottom-20 right-4 z-40"
          >
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => setIsMobileCartOpen(true)}
              className="flex items-center gap-3 px-5 py-3.5 bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] rounded-full shadow-2xl transition-all font-semibold text-sm"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{itemCount} {t('pos.items')} · {formatCurrency(getTotal(7, true))}</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Cart Sheet */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-t-[28px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 pt-4 pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8B6F5A]">
                {t('pos.currentOrder')}
              </span>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="text-xs font-bold text-[#6E6E73] p-1"
              >
                Done
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <OrderPanel
                onProceedToPayment={() => {
                  setIsMobileCartOpen(false);
                  setIsPaymentModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductCustomizerModal
        isOpen={!!customizingProduct}
        product={customizingProduct}
        modifierGroups={modifierGroups}
        onClose={() => setCustomizingProduct(null)}
        onAddToCart={handleAddCustomizedToCart}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onNewOrder={() => {
          setIsPaymentModalOpen(false);
          setIsMobileCartOpen(false);
        }}
      />
    </div>
  );
};
