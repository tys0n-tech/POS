import React, { useState } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useStaffStore } from '../../stores/useStaffStore';
import { CustomerSelectModal } from './CustomerSelectModal';
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
  Sparkles,
  UtensilsCrossed,
  ShoppingBag as BagIcon,
  Receipt,
  Coffee
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
    discountType,
    discountValue,
    setOrderType,
    setTableOrPager,
    setCustomer,
    setDiscount,
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

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountMenuOpen, setIsDiscountMenuOpen] = useState(false);

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
                Current Order
              </h3>
              <span className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                Cashier: {currentStaff.name}
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
              Clear
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
                {customer ? `${customer.loyaltyPoints} pts` : 'No loyalty'}
              </span>
            </div>
          </button>

          {/* Dine-In / Takeaway Toggle */}
          <div className="p-0.5 rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] flex">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setOrderType('DINE_IN');
              }}
              className={cn(
                'flex-1 py-1 rounded-[8px] text-[10px] font-bold transition-all flex items-center justify-center gap-1',
                orderType === 'DINE_IN'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs'
                  : 'text-[#6E6E73] dark:text-[#98989D]'
              )}
            >
              <UtensilsCrossed className="w-2.5 h-2.5" />
              <span>Dine-In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setOrderType('TAKEAWAY');
              }}
              className={cn(
                'flex-1 py-1 rounded-[8px] text-[10px] font-bold transition-all flex items-center justify-center gap-1',
                orderType === 'TAKEAWAY'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs'
                  : 'text-[#6E6E73] dark:text-[#98989D]'
              )}
            >
              <BagIcon className="w-2.5 h-2.5" />
              <span>Takeaway</span>
            </button>
          </div>
        </div>

        {/* Table / Pager Input */}
        <input
          type="text"
          value={tableOrPager}
          onChange={(e) => setTableOrPager(e.target.value)}
          placeholder="Table or Pager number (e.g. Table 4 / #08)..."
          className="w-full bg-black/[0.02] dark:bg-white/[0.03] text-[11px] rounded-[8px] border border-black/5 dark:border-white/5 px-2.5 py-1 text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#6E6E73]/50 focus:outline-none focus:border-[#8B6F5A]/40"
        />
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-[#6E6E73] dark:text-[#98989D]">
              <Coffee className="w-5 h-5 opacity-40" />
            </div>
            <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Current Order is Empty
            </p>
            <p className="text-xs text-[#6E6E73] dark:text-[#98989D] max-w-[200px]">
              Tap items from the menu to build the customer&apos;s order ticket.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-2 transition-all"
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
                      {formatCurrency(item.unitPrice)} each
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
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-[6px] bg-white dark:bg-[#2C2C2E] flex items-center justify-center text-xs text-[#1D1D1F] dark:text-[#F5F5F7] active:scale-95 shadow-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-[6px] bg-white dark:bg-[#2C2C2E] flex items-center justify-center text-xs text-[#1D1D1F] dark:text-[#F5F5F7] active:scale-95 shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-[#6E6E73] hover:text-[#FF3B30] text-xs p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Summary & Calculations */}
      <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
        {/* Discount Button / Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDiscountMenuOpen(!isDiscountMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-medium text-[#6E6E73] dark:text-[#98989D] transition-all"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#8B6F5A] dark:text-[#D4BBA5]" />
              <span>
                {discountType === 'NONE'
                  ? 'Add Discount / Promotion'
                  : discountType === 'PERCENTAGE'
                  ? `Discount (${discountValue}%)`
                  : `Discount (${formatCurrency(discountValue)})`}
              </span>
            </div>
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {discount > 0 ? `-${formatCurrency(discount)}` : 'Edit'}
            </span>
          </button>

          {/* Discount Preset Popover */}
          {isDiscountMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white dark:bg-[#2C2C2E] rounded-[14px] shadow-xl border border-black/10 dark:border-white/10 grid grid-cols-2 gap-1.5 z-20">
              <button
                type="button"
                onClick={() => handleSelectDiscount('NONE', 0)}
                className="p-2 text-xs font-medium text-left rounded-[8px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              >
                No Discount
              </button>
              <button
                type="button"
                onClick={() => handleSelectDiscount('PERCENTAGE', 10)}
                className="p-2 text-xs font-medium text-left rounded-[8px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              >
                10% Staff Discount
              </button>
              <button
                type="button"
                onClick={() => handleSelectDiscount('PERCENTAGE', 15)}
                className="p-2 text-xs font-medium text-left rounded-[8px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              >
                15% VIP Promo
              </button>
              <button
                type="button"
                onClick={() => handleSelectDiscount('FIXED', 50)}
                className="p-2 text-xs font-medium text-left rounded-[8px] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              >
                ฿50 Voucher
              </button>
            </div>
          )}
        </div>

        {/* Lines */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-[#6E6E73] dark:text-[#98989D]">
            <span>Subtotal ({itemCount} items)</span>
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-[#34C759]">
              <span>Discount</span>
              <span className="font-medium">-{formatCurrency(discount)}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between text-[11px] text-[#6E6E73] dark:text-[#98989D]">
              <span>VAT ({settings.vatRate}% {settings.vatIncluded ? 'Incl.' : 'Excl.'})</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
        </div>

        {/* Total Box */}
        <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-baseline justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] block leading-tight">
              Total
            </span>
            <span className="text-[10px] text-[#6E6E73]/70 dark:text-[#98989D]/70">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onProceedToPayment();
          }}
          disabled={items.length === 0}
          className="w-full h-12 bg-[#1D1D1F] text-white hover:bg-[#2C2C2E] active:bg-[#000000] dark:bg-[#F5F5F7] dark:text-[#1D1D1F] dark:hover:bg-[#FFFFFF] rounded-[14px] font-bold text-sm transition-all duration-150 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-between px-5 shadow-sm"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Customer Select Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        selectedCustomer={customer}
        onSelect={setCustomer}
      />
    </div>
  );
};
