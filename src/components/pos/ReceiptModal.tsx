import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, Check, Copy } from 'lucide-react';
import { Order } from '../../types';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { sound } from '../../utils/audio';
import { SegmentedControl } from '../ui/SegmentedControl';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const { settings } = useSettingsStore();
  const { t } = useTranslation();
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm'>(
    (settings.printerPaperWidth as '80mm' | '58mm') || '80mm'
  );
  const [isCopied, setIsCopied] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          {/* Backdrop Click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[24px] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-[#8B6F5A] text-white flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {t('receipt.previewTitle')}
                  </h3>
                  <span className="text-[11px] font-mono text-[#6E6E73] dark:text-[#98989D]">
                    {order.orderNumber}
                  </span>
                </div>
              </div>

              {/* Paper Size Switcher & Close */}
              <div className="flex items-center gap-2">
                <SegmentedControl<'80mm' | '58mm'>
                  layoutId="receipt-papersize-tabs"
                  value={paperSize}
                  onChange={setPaperSize}
                  size="sm"
                  options={[
                    { value: '80mm', label: '80mm' },
                    { value: '58mm', label: '58mm' }
                  ]}
                />

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 flex items-center justify-center text-[#6E6E73] dark:text-[#98989D] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Receipt Slip Preview */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-[#E5E5EA] dark:bg-[#000000]">
              <div
                id="thermal-receipt-printable"
                className={`bg-white text-black p-6 font-mono text-xs shadow-md rounded-[4px] leading-relaxed transition-all duration-200 ${
                  paperSize === '80mm' ? 'w-[320px]' : 'w-[250px] text-[11px] p-4'
                }`}
              >
                {/* Store Header */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-black/40">
                  <h2 className="font-bold text-sm tracking-tight">{settings.storeName}</h2>
                  <p className="text-[10px] opacity-80">{settings.branchName}</p>
                  <p className="text-[10px] opacity-70 leading-tight">{settings.address}</p>
                  <p className="text-[10px] opacity-70">Tel: {settings.phone}</p>
                  {settings.taxId && (
                    <p className="text-[10px] opacity-80 font-semibold">
                      TAX ID: {settings.taxId}
                    </p>
                  )}
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 border border-black text-[9px] font-bold">
                      {t('receipt.taxInvoice')}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="py-2.5 border-b border-dashed border-black/40 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span>{t('receipt.receiptNo')}:</span>
                    <span className="font-bold">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('receipt.date')}:</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('receipt.time')}:</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('receipt.cashier')}:</span>
                    <span>{order.staffName || 'Staff'}</span>
                  </div>
                  {order.tableOrPager && (
                    <div className="flex justify-between font-bold">
                      <span>{t('receipt.table')}:</span>
                      <span>{order.tableOrPager}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t('receipt.orderType')}:</span>
                    <span className="font-bold">
                      {order.orderType === 'DINE_IN' ? t('pos.dineIn') : t('pos.takeaway')}
                    </span>
                  </div>
                  {order.customer && (
                    <div className="flex justify-between text-[9px] pt-0.5 text-black/80">
                      <span>Customer: {order.customer.name}</span>
                      <span>Points: {order.customer.loyaltyPoints}</span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="py-2.5 border-b border-dashed border-black/40 space-y-2">
                  <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-black/10">
                    <span className="flex-1">{t('receipt.item')}</span>
                    <span className="w-8 text-center">{t('receipt.qty')}</span>
                    <span className="w-16 text-right">{t('receipt.price')}</span>
                  </div>

                  {order.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-start">
                        <span className="flex-1 font-semibold leading-tight pr-1">
                          {item.productName}
                        </span>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <span className="w-16 text-right font-medium">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>

                      {/* Modifiers List */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="pl-2 text-[9px] opacity-70 leading-tight">
                          {item.modifiers.map((m, mIdx) => (
                            <div key={mIdx}>
                              + {m.optionName}{' '}
                              {m.priceDelta > 0 && `(+${formatCurrency(m.priceDelta)})`}
                            </div>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <div className="pl-2 text-[9px] italic opacity-60">
                          * {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals Calculation */}
                <div className="py-2.5 border-b border-dashed border-black/40 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>{t('receipt.subtotal')}:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-black">
                      <span>{t('receipt.discount')}:</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] opacity-75">
                    <span>{t('receipt.vatIncluded')}:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-black/20">
                    <span>{t('receipt.total')}:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="py-2 border-b border-dashed border-black/40 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span>{t('receipt.paymentMethod')}:</span>
                    <span className="font-bold">{order.paymentMethod}</span>
                  </div>
                  {order.paymentDetails?.receivedAmount && (
                    <>
                      <div className="flex justify-between">
                        <span>{t('receipt.cashTendered')}:</span>
                        <span>{formatCurrency(order.paymentDetails.receivedAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>{t('receipt.change')}:</span>
                        <span>{formatCurrency(order.paymentDetails.changeAmount || 0)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Message */}
                <div className="text-center pt-3 space-y-1 text-[9px] opacity-80">
                  <p className="font-semibold">{settings.receiptHeaderMessage}</p>
                  <p>{settings.receiptFooterMessage}</p>
                  <p className="pt-2 text-[8px] opacity-60">Powered by Northline Café POS</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#1C1C1E] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-[12px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all"
              >
                {t('receipt.closeButton')}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] bg-[#8B6F5A] hover:bg-[#7A614E] text-white text-xs font-bold shadow-md shadow-[#8B6F5A]/20 transition-all active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>{t('receipt.printButton')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
