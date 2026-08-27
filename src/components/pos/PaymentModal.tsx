import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Keypad } from '../ui/Keypad';
import { ReceiptView } from '../ui/ReceiptView';
import { Order, PaymentMethod, Product } from '../../types';
import { useCartStore } from '../../stores/useCartStore';
import { useOrderStore } from '../../stores/useOrderStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { useStaffStore } from '../../stores/useStaffStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useProductStore } from '../../stores/useProductStore';
import { useToastStore } from '../../stores/useToastStore';
import { formatCurrency } from '../../utils/format';
import { sound } from '../../utils/audio';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Printer, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onNewOrder
}) => {
  const {
    items,
    customer,
    orderType,
    tableOrPager,
    notes,
    discountType,
    discountValue,
    getSubtotal,
    getDiscount,
    getTax,
    getTotal,
    clearCart
  } = useCartStore();

  const { settings } = useSettingsStore();
  const { currentStaff } = useStaffStore();
  const { currentShift, recordSale } = useShiftStore();
  const { createOrder } = useOrderStore();
  const { deductRecipeItems } = useInventoryStore();
  const { recordCustomerOrder } = useCustomerStore();
  const { products } = useProductStore();
  const { showToast } = useToastStore();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const tax = getTax(settings.vatRate, settings.vatIncluded);
  const total = getTotal(settings.vatRate, settings.vatIncluded);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PROMPTPAY');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Default cash tendered to exact total when modal opens or total changes
  useEffect(() => {
    if (isOpen) {
      setCashTendered(total.toString());
      setCompletedOrder(null);
      setShowReceiptModal(false);
      setIsProcessing(false);
    }
  }, [isOpen, total]);

  const receivedAmount = parseFloat(cashTendered) || 0;
  const changeAmount = Math.max(0, receivedAmount - total);
  const isCashSufficient = paymentMethod !== 'CASH' || receivedAmount >= total;

  const handleCompletePayment = () => {
    if (!isCashSufficient) {
      sound.playError();
      showToast({ type: 'error', title: 'Insufficient Cash', message: 'Tendered cash is less than order total' });
      return;
    }

    setIsProcessing(true);
    sound.playClick();

    setTimeout(() => {
      // 1. Create the Order
      const newOrder = createOrder({
        items,
        subtotal,
        discount,
        discountType,
        tax,
        total,
        paymentMethod,
        paymentDetails: {
          id: `pay-${Date.now()}`,
          orderId: '',
          amount: total,
          method: paymentMethod,
          receivedAmount: paymentMethod === 'CASH' ? receivedAmount : total,
          changeAmount: paymentMethod === 'CASH' ? changeAmount : 0,
          status: 'PAID',
          createdAt: new Date().toISOString()
        },
        customer,
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        registerId: currentShift?.registerName || 'Main Terminal',
        shiftId: currentShift?.id || 'shift-default',
        tableOrPager,
        orderType,
        notes
      });

      // 2. Deduct Inventory stock automatically based on product recipes
      items.forEach((cartItem) => {
        const prod = products.find((p) => p.id === cartItem.productId);
        if (prod && prod.recipe && prod.recipe.length > 0) {
          const scaledRecipes = prod.recipe.map((r) => ({
            ...r,
            quantity: r.quantity * cartItem.quantity
          }));
          deductRecipeItems(scaledRecipes, newOrder.orderNumber, currentStaff.name);
        }
      });

      // 3. Record in Cash Drawer Shift
      recordSale(total, paymentMethod === 'CASH');

      // 4. Update Customer points & loyalty
      if (customer) {
        recordCustomerOrder(customer.id, total, items[0]?.productName);
      }

      // 5. Tactile celebratory feedback
      sound.playSuccess();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8B6F5A', '#34C759', '#1D1D1F']
        });
      } catch {
        // ignore
      }

      setIsProcessing(false);
      setCompletedOrder(newOrder);
      clearCart();
    }, 450);
  };

  const handleStartNewOrder = () => {
    sound.playClick();
    onClose();
    onNewOrder();
  };

  const methods: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'PROMPTPAY', label: 'PromptPay', icon: QrCode },
    { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
    { id: 'QR_CODE', label: 'QR Payment', icon: Smartphone }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (completedOrder) {
          handleStartNewOrder();
        } else {
          onClose();
        }
      }}
      title={completedOrder ? 'Payment Successful' : 'Payment'}
      subtitle={completedOrder ? `Order ${completedOrder.orderNumber} completed` : `Total Due: ${formatCurrency(total)}`}
      maxWidth="md"
    >
      {!completedOrder ? (
        <div className="space-y-5">
          {/* Prominent Amount Header */}
          <div className="p-4 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] text-center">
            <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
              Amount to Pay
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
              {formatCurrency(total)}
            </h2>
            {discount > 0 && (
              <p className="text-xs text-[#34C759] font-medium mt-0.5">
                Discount Applied: -{formatCurrency(discount)}
              </p>
            )}
          </div>

          {/* Payment Method Selector Grid */}
          <div className="grid grid-cols-4 gap-2">
            {methods.map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setPaymentMethod(m.id);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-[14px] border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] text-[#1D1D1F] dark:text-white ring-1 ring-[#8B6F5A]'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/5 dark:border-white/10 text-[#6E6E73] dark:text-[#98989D] hover:bg-black/[0.04]'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#8B6F5A] dark:text-[#D4BBA5]' : ''}`} />
                  <span className="text-[11px] font-semibold">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* CASH: Keypad & Change Calculation */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04]">
                <div>
                  <span className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
                    Received Amount
                  </span>
                  <p className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {formatCurrency(receivedAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
                    Change Due
                  </span>
                  <p className={`text-xl font-bold ${changeAmount > 0 ? 'text-[#34C759]' : 'text-[#1D1D1F] dark:text-[#F5F5F7]'}`}>
                    {formatCurrency(changeAmount)}
                  </p>
                </div>
              </div>

              <Keypad
                value={cashTendered}
                onChange={setCashTendered}
                quickCashAmounts={[total, 100, 500, 1000]}
                onQuickCash={(amt) => setCashTendered(amt.toString())}
              />
            </div>
          )}

          {/* PROMPTPAY: Minimal QR Display */}
          {paymentMethod === 'PROMPTPAY' && (
            <div className="flex flex-col items-center justify-center p-5 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-center space-y-3">
              <div className="p-3 bg-white rounded-[14px] shadow-sm border border-black/10">
                {/* Clean simulated PromptPay QR pattern */}
                <div className="w-40 h-40 bg-contain bg-center bg-no-repeat flex flex-col items-center justify-center border-2 border-black/20 rounded-[8px] p-2">
                  <div className="grid grid-cols-5 gap-1 w-full h-full p-2 bg-black/[0.03]">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 5 === 0 || i === 12) ? 'bg-[#1D1D1F]' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  PromptPay QR Code
                </p>
                <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                  Scan with any Thai mobile banking application
                </p>
              </div>
            </div>
          )}

          {/* CREDIT CARD: Terminal Simulation */}
          {paymentMethod === 'CREDIT_CARD' && (
            <div className="flex flex-col items-center justify-center p-8 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-center space-y-3">
              <CreditCard className="w-12 h-12 text-[#8B6F5A] animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Waiting for Card Terminal
                </p>
                <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                  Insert, tap, or swipe customer card on EDC terminal
                </p>
              </div>
            </div>
          )}

          {/* QR Payment Simulation */}
          {paymentMethod === 'QR_CODE' && (
            <div className="flex flex-col items-center justify-center p-8 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-center space-y-3">
              <Smartphone className="w-12 h-12 text-[#0071E3] animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Scan Customer QR Code
                </p>
                <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                  Present 2D barcode scanner to customer&apos;s digital wallet
                </p>
              </div>
            </div>
          )}

          {/* Complete Payment Button */}
          <Button
            variant="tonal"
            size="xl"
            className="w-full h-14"
            disabled={!isCashSufficient}
            isLoading={isProcessing}
            onClick={handleCompletePayment}
          >
            <span>Complete Payment · {formatCurrency(total)}</span>
          </Button>
        </div>
      ) : (
        /* Payment Success View */
        <div className="flex flex-col items-center text-center space-y-5 py-4">
          <div className="w-16 h-16 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Payment Successful
            </h3>
            <p className="text-sm font-semibold text-[#8B6F5A] dark:text-[#D4BBA5] mt-1">
              Order {completedOrder.orderNumber}
            </p>
            <p className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-2">
              {formatCurrency(completedOrder.total)}
            </p>
          </div>

          {completedOrder.paymentMethod === 'CASH' && completedOrder.paymentDetails?.changeAmount !== undefined && (
            <div className="w-full p-3 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04] flex justify-between items-center text-xs">
              <span className="text-[#6E6E73] dark:text-[#98989D]">Cash Change Given:</span>
              <span className="text-base font-bold text-[#34C759]">
                {formatCurrency(completedOrder.paymentDetails.changeAmount)}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 w-full pt-2">
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => setShowReceiptModal(true)}
            >
              Print Receipt
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleStartNewOrder}
            >
              New Order
            </Button>
          </div>

          {/* Embedded printable receipt preview modal */}
          <Modal
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            title="Receipt Preview"
            maxWidth="sm"
          >
            <ReceiptView
              order={completedOrder}
              settings={settings}
              onPrint={() => {
                showToast({ type: 'success', title: 'Receipt Sent to Printer' });
              }}
            />
          </Modal>
        </div>
      )}
    </Modal>
  );
};
