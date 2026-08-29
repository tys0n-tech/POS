import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../stores/useCartStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useStaffStore } from '../../stores/useStaffStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CustomerSelectModal } from './CustomerSelectModal';
import { TableSelectModal } from './TableSelectModal';
import { SegmentedControl } from '../ui/SegmentedControl';
import { formatCurrency, cn } from '../../utils/format';
import { sound } from '../../utils/audio';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Tag, 
  ArrowRight, 
  UtensilsCrossed,
  ShoppingBag as BagIcon,
  Receipt,
  Coffee,
  MapPin,
  Ticket,
  X
} from 'lucide-react';

interface OrderPanelProps {
  onProceedToPayment: () => void;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({ onProceedToPayment }) => {
  const {
    items,
    customer,
    orderType,
    tableOrPager,
    selectedTableId,
    discountType,
    discountValue,
    appliedCouponCode,
    appliedCouponDesc,
    setOrderType,
    setTableOrPager,
    setDiscount,
    applyCoupon,
    removeCoupon,
    updateItemQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDiscount,
    getTax,
    getTotal,
    getItemCount
  } = useCartStore();

  const { settings } = useSettingsStore();
  const { currentStaff } = useStaffStore();
  const { showToast } = useToastStore();
  const { t } = useTranslation();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isDiscountMenuOpen, setIsDiscountMenuOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const tax = getTax(settings.vatRate, settings.vatIncluded);
  const total = getTotal(settings.vatRate, settings.vatIncluded);
  const itemCount = getItemCount();

  const handleSelectDiscount = (type: 'NONE' | 'PERCENTAGE' | 'FIXED', val: number) => {
    sound.playClick();
    setDiscount(type, val);
    setIsDiscountMenuOpen(false);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      showToast({ type: 'success', title: 'Promo Code Applied', message: res.message });
      setCouponInput('');
      setIsDiscountMenuOpen(false);
    } else {
      sound.playError();
      showToast({ type: 'error', title: 'Invalid Promo Code', message: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    sound.playClick();
    removeCoupon();
    showToast({ type: 'info', title: 'Promo Code Removed', message: 'Discount cleared' });
  };

  return (
    <div className="w-full h-full bg-white dark:bg-[#1C1C1E] border-l border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between select-none shadow-sm transition-colors">
      {/* Top Header */}
      <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#8B6F5A]/15 text-[#8B6F5A] dark:text-[#D4BBA5] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] leading-none">
                {t('pos.currentOrder')}
              </h3>
              <span className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                {t('receipt.cashier')}: {currentStaff.name}
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                clearCart();
              }}
              className="text-[11px] font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 px-2 py-1 rounded-[8px] transition-colors"
            >
              {t('pos.clear')}
            </button>
          )}
        </div>

        {/* Customer & Dining Mode Selectors */}
        <div className="grid grid-cols-2 gap-2">
          {/* Customer Button */}
          <button
            type="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-left transition-all overflow-hidden"
          >
            <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#6E6E73] dark:text-[#98989D] shrink-0">
              <User className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate leading-tight">
                {customer ? customer.name : 'Walk-in'}
              </p>
              <span className="text-[9px] text-[#6E6E73] dark:text-[#98989D] block leading-none">
                {customer ? `${customer.loyaltyPoints} ${t('pos.points')}` : t('pos.selectCustomer')}
              </span>
            </div>
          </button>

          {/* Dine-In / Takeaway Toggle */}
          <SegmentedControl<'DINE_IN' | 'TAKEAWAY'>
            layoutId="order-panel-dining-type"
            value={orderType}
            onChange={setOrderType}
            size="sm"
            fullWidth
            options={[
              {
                value: 'DINE_IN',
                label: t('pos.dineIn'),
                icon: UtensilsCrossed
              },
              {
                value: 'TAKEAWAY',
                label: t('pos.takeaway'),
                icon: BagIcon
              }
            ]}
          />
        </div>

        {/* Table Selector / Pager Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            className={cn(
              'flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-[10px] border text-left transition-all text-xs font-semibold',
              tableOrPager || selectedTableId
                ? 'bg-[#8B6F5A]/10 border-[#8B6F5A]/40 text-[#8B6F5A] dark:text-[#D4BBA5]'
                : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/5 text-[#6E6E73] hover:border-black/20'
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {tableOrPager ? tableOrPager : 'Select Table / Seating'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold opacity-75">
              {tableOrPager ? 'Change' : 'Choose'}
            </span>
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-[#6E6E73] dark:text-[#98989D]">
              <Coffee className="w-5 h-5 opacity-40" />
            </div>
            <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {t('pos.emptyCartTitle')}
            </p>
            <p className="text-xs text-[#6E6E73] dark:text-[#98989D] max-w-[200px]">
              {t('pos.emptyCartSubtitle')}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="p-3 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-2 transition-shadow hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-10 h-10 rounded-[8px] object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight truncate">
                        {item.productName}
                      </h4>
                      <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D]">
                        {formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] shrink-0">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>

                {/* Modifiers chips */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-12">
                    {item.modifiers.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#98989D]"
                      >
                        {m.optionName}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="text-[10px] italic text-[#8B6F5A] dark:text-[#D4BBA5] pl-12">
                    Note: {item.notes}
                  </div>
                )}

                {/* Stepper & Remove */}
                <div className="flex items-center justify-between pt-1 border-t border-black/[0.04] dark:border-white/[0.06] pl-12">
                  <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-[8px]">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      type="button"
                      onClick={() => updateItemQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-[6px] bg-white dark:bg-[#2C2C2E] flex items-center justify-center text-xs text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </motion.button>
                    <span className="w-6 text-center text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {item.quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      type="button"
                      onClick={() => updateItemQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-[6px] bg-white dark:bg-[#2C2C2E] flex items-center justify-center text-xs text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-[#6E6E73] hover:text-[#FF3B30] text-xs p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Order Summary & Calculations */}
      <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
        {/* Discount / Coupon Button / Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDiscountMenuOpen(!isDiscountMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-medium text-[#6E6E73] dark:text-[#98989D] transition-all"
          >
            <div className="flex items-center gap-2 truncate mr-2">
              <Tag className="w-3.5 h-3.5 text-[#8B6F5A] dark:text-[#D4BBA5] shrink-0" />
              <span className="truncate">
                {appliedCouponCode
                  ? `Promo: ${appliedCouponCode}`
                  : discountType === 'NONE'
                  ? t('pos.addDiscount')
                  : discountType === 'PERCENTAGE'
                  ? `${t('pos.discount')} (${discountValue}%)`
                  : `${t('pos.discount')} (${formatCurrency(discountValue)})`}
              </span>
            </div>
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] shrink-0">
              {discount > 0 ? `-${formatCurrency(discount)}` : 'Edit'}
            </span>
          </button>

          {/* Discount & Promo Code Popover */}
          <AnimatePresence>
            {isDiscountMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-[#FFFFFF]/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xl rounded-[18px] shadow-2xl border border-black/10 dark:border-white/10 space-y-2.5 z-20"
              >
                {/* Promo Code Input Form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Ticket className="w-3.5 h-3.5 text-[#8B6F5A] absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (e.g. VIP20)"
                      className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-[10px] pl-8 pr-2 py-1.5 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-[#8B6F5A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#8B6F5A] text-white rounded-[10px] text-xs font-bold hover:bg-[#7A5F4B] transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {appliedCouponCode && (
                  <div className="flex items-center justify-between p-2 rounded-[10px] bg-[#34C759]/10 text-[#34C759] text-xs font-medium">
                    <span>{appliedCouponDesc || appliedCouponCode}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[#FF3B30] hover:bg-[#FF3B30]/10 p-1 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Preset Discounts Grid */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleSelectDiscount('NONE', 0)}
                    className="p-2 text-xs font-medium text-left rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                  >
                    No Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDiscount('PERCENTAGE', 10)}
                    className="p-2 text-xs font-medium text-left rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                  >
                    10% Staff / Member
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDiscount('PERCENTAGE', 15)}
                    className="p-2 text-xs font-medium text-left rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                  >
                    15% VIP Promo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDiscount('FIXED', 50)}
                    className="p-2 text-xs font-medium text-left rounded-[10px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                  >
                    ฿50 Voucher
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lines */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-[#6E6E73] dark:text-[#98989D]">
            <span>{t('pos.subtotal')} ({itemCount} {t('pos.items')})</span>
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-[#34C759]">
              <span>{t('pos.discount')}</span>
              <span className="font-semibold">-{formatCurrency(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-[#6E6E73] dark:text-[#98989D]">
            <span>{t('pos.vat')} ({settings.vatRate}%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-black/[0.06] dark:border-white/[0.08] text-sm">
            <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {t('pos.total')}
            </span>
            <span className="text-xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Charge Checkout Button */}
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => {
            sound.playClick();
            onProceedToPayment();
          }}
          className="w-full py-3.5 px-4 rounded-[14px] bg-[#8B6F5A] hover:bg-[#7A5F4B] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm shadow-md transition-all flex items-center justify-between"
        >
          <span>{t('pos.charge')}</span>
          <div className="flex items-center gap-2">
            <span>{formatCurrency(total)}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Customer Select Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        selectedCustomer={customer}
        onSelect={(c) => {
          useCartStore.getState().setCustomer(c);
        }}
      />

      {/* Table Select Modal */}
      <TableSelectModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
    </div>
  );
};
