import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product, ModifierGroup, OrderItemModifier } from '../../types';
import { formatCurrency, cn } from '../../utils/format';
import { sound } from '../../utils/audio';
import { Plus, Minus, Check, Sparkles } from 'lucide-react';

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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Find modifier groups assigned to this product
  const assignedGroups = product
    ? modifierGroups.filter((g) => product.modifierGroupIds?.includes(g.id))
    : [];

  // Reset defaults when opening with a product
  useEffect(() => {
    if (product) {
      const defaults: Record<string, string[]> = {};
      assignedGroups.forEach((group) => {
        if (group.type === 'SINGLE') {
          const defaultOpt = group.options.find((o) => o.isDefault) || group.options[0];
          if (defaultOpt) {
            defaults[group.id] = [defaultOpt.id];
          }
        } else {
          // Multiple selections default empty or with isDefault
          defaults[group.id] = group.options.filter((o) => o.isDefault).map((o) => o.id);
        }
      });
      setSelectedOptions(defaults);
      setQuantity(1);
      setNotes('');
    }
  }, [product]);

  if (!product) return null;

  const handleOptionToggle = (group: ModifierGroup, optionId: string) => {
    sound.playClick();
    if (group.type === 'SINGLE') {
      setSelectedOptions((prev) => ({
        ...prev,
        [group.id]: [optionId]
      }));
    } else {
      // Multiple selection
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

  const unitPrice = product.basePrice + modifierPriceDelta;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = () => {
    onAddToCart(product, flatSelectedModifiers, quantity, notes.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={product.description}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Quantity Stepper with Spring buttons */}
          <div className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-[14px]">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sound.playClick();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-[10px] bg-white dark:bg-[#2C2C2E] shadow-xs flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            <span className="w-8 text-center font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
              {quantity}
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sound.playClick();
                setQuantity((q) => q + 1);
              }}
              className="w-9 h-9 rounded-[10px] bg-white dark:bg-[#2C2C2E] shadow-xs flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Price & Add to Order CTA */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              variant="tonal"
              size="lg"
              className="px-8 shadow-md"
              onClick={handleSubmit}
            >
              <span>Add to Order · {formatCurrency(totalPrice)}</span>
            </Button>
          </motion.div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Product Visual Banner with Smooth Image Presentation */}
        <div className="flex items-center gap-4 p-3.5 rounded-[18px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] overflow-hidden">
          <div className="w-20 h-20 rounded-[14px] overflow-hidden bg-black/[0.04] dark:bg-white/[0.06] shrink-0 relative shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block px-2 py-0.5 rounded-full bg-[#8B6F5A]/15 text-[#8B6F5A] dark:text-[#D4BBA5] text-[10px] font-bold uppercase tracking-wider mb-1">
              {product.category}
            </span>
            <h4 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
              {product.name}
            </h4>
            <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#98989D] mt-0.5">
              Base Price: {formatCurrency(product.basePrice)}
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
                  <span className="text-[10px] text-[#8B6F5A] dark:text-[#D4BBA5] font-semibold px-2 py-0.5 rounded-full bg-[#8B6F5A]/10">
                    Required
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {group.options.map((option) => {
                  const isSelected = currentSelected.includes(option.id);

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleOptionToggle(group, option.id)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-[14px] text-xs font-medium border transition-all duration-200 select-none text-left',
                        isSelected
                          ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] text-[#1D1D1F] dark:text-white ring-1 ring-[#8B6F5A] shadow-xs'
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
                        <span className="text-[11px] font-semibold opacity-80 shrink-0 font-sans tabular-nums">
                          +{formatCurrency(option.priceDelta)}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Special Instructions / Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
            Special Instructions
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Extra hot, separate lid, oat foam..."
            rows={2}
            className="w-full bg-black/[0.03] dark:bg-white/[0.06] text-sm rounded-[14px] border border-black/10 dark:border-white/10 p-3 text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#6E6E73]/50 focus:outline-none focus:border-[#8B6F5A] focus:ring-2 focus:ring-[#8B6F5A]/20 transition-all resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
