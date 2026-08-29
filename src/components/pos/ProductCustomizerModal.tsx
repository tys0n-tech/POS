import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '../../stores/useProductStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Product, ModifierGroup, OrderItemModifier } from '../../types';
import { formatCurrency, cn } from '../../utils/format';
import { sound } from '../../utils/audio';
import { Plus, Minus, Check, X } from 'lucide-react';

export interface ProductCustomizerModalProps {
  product: Product | null;
  modifierGroups: ModifierGroup[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedModifiers: OrderItemModifier[], quantity: number, notes: string) => void;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  product,
  modifierGroups,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const { setCustomizingProduct } = useProductStore();
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Find modifier groups assigned to this product
  const assignedGroups = product
    ? modifierGroups.filter((g) => product.modifierGroupIds?.includes(g.id))
    : [];

  // Reset defaults when opening with a product
  useEffect(() => {
    if (product && isOpen) {
      const defaults: Record<string, string[]> = {};
      assignedGroups.forEach((group) => {
        if (group.type === 'SINGLE') {
          const defaultOpt = group.options.find((o) => o.isDefault) || group.options[0];
          if (defaultOpt) {
            defaults[group.id] = [defaultOpt.id];
          }
        } else {
          defaults[group.id] = group.options.filter((o) => o.isDefault).map((o) => o.id);
        }
      });
      setSelectedOptions(defaults);
      setQuantity(1);
      setNotes('');
    }
  }, [product, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleTriggerClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleTriggerClose = () => {
    onClose();
    setTimeout(() => {
      setCustomizingProduct(null, null);
    }, 300); // clear product after exit animation
  };

  const handleOptionToggle = (group: ModifierGroup, optionId: string) => {
    sound.playClick();
    if (group.type === 'SINGLE') {
      setSelectedOptions((prev) => ({
        ...prev,
        [group.id]: [optionId]
      }));
    } else {
      const current = selectedOptions[group.id] || [];
      const exists = current.includes(optionId);
      const next = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      setSelectedOptions((prev) => ({
        ...prev,
        [group.id]: next
      }));
    }
  };

  // Compute live price
  let modifierPriceDelta = 0;
  const flatSelectedModifiers: OrderItemModifier[] = [];

  assignedGroups.forEach((group) => {
    const selectedIds = selectedOptions[group.id] || [];
    group.options.forEach((opt) => {
      if (selectedIds.includes(opt.id)) {
        modifierPriceDelta += opt.priceDelta;
        flatSelectedModifiers.push({
          groupId: group.id,
          groupName: group.name,
          optionId: opt.id,
          optionName: opt.name,
          priceDelta: opt.priceDelta
        });
      }
    });
  });

  const unitPrice = (product?.basePrice || 0) + modifierPriceDelta;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = () => {
    if (!product) return;
    onAddToCart(product, flatSelectedModifiers, quantity, notes.trim());
    handleTriggerClose();
  };

  const modalElement = (
    <AnimatePresence>
      {isOpen && product && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          className="select-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleTriggerClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998
            }}
            className="bg-black/40 dark:bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'relative',
              zIndex: 99999,
              width: '100%',
              maxWidth: '540px',
              maxHeight: '88vh'
            }}
            className="bg-white dark:bg-[#1C1C1E] shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-black/10 dark:border-white/10 rounded-[24px] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0 bg-white/50 dark:bg-[#1C1C1E]/50 backdrop-blur-xl">
              <div>
                <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  {product.name}
                </h3>
                <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                  {product.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  handleTriggerClose();
                }}
                className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] flex items-center justify-center text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 overflow-y-auto space-y-6 flex-1">
              {/* Product Info Banner */}
              <div className="flex items-center gap-4 p-3 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-[12px] object-cover shadow-xs"
                />
                <div>
                  <span className="text-xs font-semibold text-[#8B6F5A] dark:text-[#D4BBA5] uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h4 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {product.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                    {t('customizer.basePrice')}: {formatCurrency(product.basePrice)}
                  </p>
                </div>
              </div>

              {/* Modifier Groups */}
              {assignedGroups.map((group) => {
                const currentSelected = selectedOptions[group.id] || [];

                return (
                  <div key={group.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                        {group.name}
                      </label>
                      {group.required && (
                        <span className="text-[10px] text-[#8B6F5A] font-medium">{t('customizer.required')}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.options.map((option) => {
                        const isSelected = currentSelected.includes(option.id);

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleOptionToggle(group, option.id)}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-[12px] text-xs font-medium border transition-all duration-150 active:scale-[0.98] select-none text-left',
                              isSelected
                                ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] text-[#1D1D1F] dark:text-white ring-1 ring-[#8B6F5A]'
                                : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/5 dark:border-white/10 text-[#6E6E73] dark:text-[#98989D] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#8B6F5A] dark:text-[#D4BBA5] shrink-0" />
                              )}
                              <span className="truncate">{option.name}</span>
                            </div>
                            {option.priceDelta !== 0 && (
                              <span className="text-[11px] font-semibold opacity-80 shrink-0">
                                +{formatCurrency(option.priceDelta)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Special Instructions / Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  {t('customizer.optional')} / Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('customizer.notesPlaceholder')}
                  rows={2}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.06] text-sm rounded-[12px] border border-black/10 dark:border-white/10 p-3 text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#6E6E73]/50 focus:outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
              {/* Quantity Stepper */}
              <div className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-[14px]">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-[10px] bg-white dark:bg-[#2C2C2E] shadow-sm flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] disabled:opacity-40 transition-all active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setQuantity((q) => q + 1);
                  }}
                  className="w-9 h-9 rounded-[10px] bg-white dark:bg-[#2C2C2E] shadow-sm flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Price & Add to Order CTA */}
              <Button
                variant="tonal"
                size="lg"
                className="px-8 shadow-md whitespace-nowrap"
                onClick={handleSubmit}
              >
                <span>{t('customizer.addToOrder')} · {formatCurrency(totalPrice)}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalElement, document.body);
};
