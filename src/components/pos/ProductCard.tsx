import React, { useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../utils/format';
import { sound } from '../../utils/audio';
import { useTranslation } from '../../hooks/useTranslation';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { Plus, AlertCircle } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  onClick: (product: Product, rect?: DOMRect) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { ingredients } = useInventoryStore();

  const handleClick = () => {
    sound.playClick();
    const rect = cardRef.current?.getBoundingClientRect();
    onClick(product, rect);
  };

  const hasModifiers = product.modifierGroupIds && product.modifierGroupIds.length > 0;

  // Check if any recipe ingredient is low on stock
  const isLowStock = product.recipe?.some((r) => {
    const ing = ingredients.find((i) => i.id === r.ingredientId);
    return ing && ing.currentStock <= ing.minimumStock;
  });

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -3, transition: { duration: 0.15, ease: 'easeOut' } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1, ease: 'easeOut' } }}
      onClick={handleClick}
      className={cn(
        'group relative bg-white dark:bg-[#1C1C1E] rounded-[20px] p-3 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] cursor-pointer flex flex-col justify-between select-none will-change-transform transition-shadow duration-150',
        !product.available && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-[16/11] w-full rounded-[14px] overflow-hidden bg-black/[0.03] dark:bg-white/[0.04] mb-2.5">
        <img
          src={product.image}
          alt={product.name}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {t('pos.outOfStockBadge')}
            </span>
          </div>
        )}

        {/* Category Pill Tag on Image */}
        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[9px] font-semibold tracking-wide shadow-xs">
          {product.category}
        </div>

        {/* Low Stock Warning Pill */}
        {isLowStock && product.available && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FF9500]/90 backdrop-blur-md text-white text-[9px] font-bold tracking-wide shadow-xs flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>{t('pos.lowStockBadge')}</span>
          </div>
        )}
      </div>

      {/* Info & Price */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-[14px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug group-hover:text-[#8B6F5A] dark:group-hover:text-[#D4BBA5] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-0.5 line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Price & Add Action */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[15px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {formatCurrency(product.basePrice)}
          </span>

          <div className={cn(
            'flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-[10px] transition-all duration-200',
            hasModifiers
              ? 'bg-black/[0.04] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#98989D] group-hover:bg-[#8B6F5A] group-hover:text-white'
              : 'bg-[#8B6F5A]/15 text-[#8B6F5A] dark:text-[#D4BBA5] group-hover:bg-[#8B6F5A] group-hover:text-white'
          )}>
            <span>{hasModifiers ? t('pos.customized') : 'Add'}</span>
            {!hasModifiers && <Plus className="w-3 h-3" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
