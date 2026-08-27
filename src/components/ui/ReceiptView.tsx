import React from 'react';
import { Order, StoreSettings } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Button } from './Button';
import { Printer, Download } from 'lucide-react';

export interface ReceiptViewProps {
  order: Order;
  settings: StoreSettings;
  onPrint?: () => void;
  showPrintActions?: boolean;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  order,
  settings,
  onPrint,
  showPrintActions = true
}) => {
  const handleNativePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Printable Area */}
      <div
        id="printable-receipt"
        className="w-full max-w-[320px] bg-white text-black p-6 rounded-[16px] shadow-sm border border-black/10 font-mono text-xs leading-relaxed"
      >
        {/* Header */}
        <div className="text-center pb-4 mb-4 border-b border-dashed border-black/20">
          <h2 className="font-bold text-base tracking-wider uppercase">{settings.storeName}</h2>
          <p className="text-[11px] text-black/70 mt-0.5">{settings.branchName}</p>
          <p className="text-[10px] text-black/60 mt-0.5">{settings.address}</p>
          <p className="text-[10px] text-black/60">Tel: {settings.phone}</p>
          {settings.taxId && <p className="text-[10px] text-black/60">Tax ID: {settings.taxId}</p>}
        </div>

        {/* Order Meta */}
        <div className="flex justify-between text-[11px] mb-1">
          <span className="font-bold">ORDER: {order.orderNumber}</span>
          <span>{order.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}</span>
        </div>
        <div className="flex justify-between text-[10px] text-black/70 mb-1">
          <span>Date: {formatDateTime(order.createdAt)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-black/70 pb-3 mb-3 border-b border-dashed border-black/20">
          <span>Staff: {order.staffName}</span>
          {order.tableOrPager && <span>Table: {order.tableOrPager}</span>}
          {order.customer && <span>Cust: {order.customer.name}</span>}
        </div>

        {/* Line Items */}
        <div className="space-y-2 pb-3 mb-3 border-b border-dashed border-black/20">
          {order.items.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium">
                  {item.quantity}x {item.productName}
                </span>
                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="text-[9px] text-black/60 pl-3">
                  {item.modifiers.map((m, mIdx) => (
                    <div key={mIdx} className="flex justify-between">
                      <span>+ {m.optionName}</span>
                      {m.priceDelta > 0 && <span>+{formatCurrency(m.priceDelta * item.quantity)}</span>}
                    </div>
                  ))}
                </div>
              )}
              {item.notes && (
                <div className="text-[9px] italic text-black/50 pl-3">
                  Note: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Calculations */}
        <div className="space-y-1 text-[11px] pb-3 mb-3 border-b border-dashed border-black/20">
          <div className="flex justify-between text-black/70">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-black/70">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          {order.tax > 0 && (
            <div className="flex justify-between text-[10px] text-black/60">
              <span>VAT ({settings.vatRate}%)</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-black/10">
            <span>TOTAL</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="text-[10px] text-black/70 space-y-0.5 pb-4 mb-4 border-b border-dashed border-black/20">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-semibold">{order.paymentMethod || 'PromptPay'}</span>
          </div>
          {order.paymentDetails?.receivedAmount !== undefined && (
            <>
              <div className="flex justify-between">
                <span>Received:</span>
                <span>{formatCurrency(order.paymentDetails.receivedAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Change:</span>
                <span>{formatCurrency(order.paymentDetails.changeAmount || 0)}</span>
              </div>
            </>
          )}
          {order.customer && (
            <div className="flex justify-between pt-1 text-[9px] text-black/60">
              <span>Loyalty Points Balance:</span>
              <span>{order.customer.loyaltyPoints} pts</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-black/60 space-y-1">
          <p className="font-medium">{settings.receiptHeaderMessage}</p>
          <p>{settings.receiptFooterMessage}</p>
          
          {/* Simulated ESC/POS Barcode */}
          <div className="pt-3 flex flex-col items-center justify-center">
            <div className="h-8 w-44 bg-repeating-linear-gradient flex items-center justify-center tracking-widest text-[9px] font-mono border-x border-black/40">
              ||| | |||| | || ||| || |||
            </div>
            <span className="text-[9px] mt-0.5 tracking-wider">{order.id}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showPrintActions && (
        <div className="flex items-center gap-3 mt-6 w-full max-w-[320px]">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handleNativePrint}
          >
            Print Receipt
          </Button>
        </div>
      )}
    </div>
  );
};
