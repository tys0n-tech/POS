import React, { useState } from 'react';
import { useOrderStore } from '../stores/useOrderStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useShiftStore } from '../stores/useShiftStore';
import { useProductStore } from '../stores/useProductStore';
import { useToastStore } from '../stores/useToastStore';
import { Order, OrderStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Sheet } from '../components/ui/Sheet';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ReceiptView } from '../components/ui/ReceiptView';
import { SearchInput } from '../components/ui/SearchInput';
import { formatCurrency, formatDateTime, formatTime, cn } from '../utils/format';
import { sound } from '../utils/audio';
import { 
  ShoppingBag, 
  Search, 
  Printer, 
  RotateCcw, 
  Filter, 
  ChevronRight,
  User,
  Coffee,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    updateOrderStatus,
    refundOrder,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    searchQuery,
    setSearchQuery
  } = useOrderStore();

  const { settings } = useSettingsStore();
  const { restockRecipeItems } = useInventoryStore();
  const { recordRefund } = useShiftStore();
  const { products } = useProductStore();
  const { showToast } = useToastStore();

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer Request / Wrong Order');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status Filter
    const matchesStatus =
      statusFilter === 'ALL' ||
      order.status === statusFilter ||
      (statusFilter === 'PAID' && order.paymentStatus === 'PAID');

    // Search query
    const cleanQ = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !cleanQ ||
      order.orderNumber.toLowerCase().includes(cleanQ) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(cleanQ)) ||
      (order.customer?.phone && order.customer.phone.includes(cleanQ)) ||
      order.items.some((i) => i.productName.toLowerCase().includes(cleanQ));

    return matchesStatus && matchesSearch;
  });

  const handleRowClick = (order: Order) => {
    sound.playClick();
    setSelectedOrder(order);
  };

  const handleConfirmRefund = () => {
    if (!selectedOrder) return;

    const res = refundOrder(selectedOrder.id, refundReason);
    if (res.success) {
      // Restock ingredients from recipes
      selectedOrder.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && prod.recipe) {
          const scaled = prod.recipe.map((r) => ({ ...r, quantity: r.quantity * item.quantity }));
          restockRecipeItems(scaled, selectedOrder.orderNumber, 'Staff', refundReason);
        }
      });

      // Record in cash register if cash
      recordRefund(selectedOrder.total, selectedOrder.paymentMethod === 'CASH');

      sound.playSuccess();
      showToast({
        type: 'success',
        title: 'Order Refunded',
        message: `${selectedOrder.orderNumber} - ${formatCurrency(selectedOrder.total)}`
      });
      setIsRefundDialogOpen(false);
    }
  };

  const getStatusBadge = (status: OrderStatus, paymentStatus: string) => {
    if (paymentStatus === 'REFUNDED') {
      return <Badge variant="error" dot>Refunded</Badge>;
    }
    switch (status) {
      case 'NEW':
        return <Badge variant="blue" dot>New</Badge>;
      case 'PREPARING':
        return <Badge variant="warning" dot>Preparing</Badge>;
      case 'READY':
        return <Badge variant="coffee" dot>Ready</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" dot>Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="error" dot>Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 select-none">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Order Management
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Total {orders.length} orders recorded in system
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-56">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search #order, customer..."
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-[12px] overflow-x-auto">
            {['ALL', 'NEW', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStatusFilter(st);
                }}
                className={cn(
                  'px-2.5 py-1 rounded-[8px] text-[11px] font-semibold transition-all whitespace-nowrap',
                  statusFilter === st
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                    : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F]'
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#98989D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Order</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-[#6E6E73] dark:text-[#98989D]">
                    No orders matching selected criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    className="h-16 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6E73] dark:text-[#98989D]">
                      {formatTime(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {order.customer ? order.customer.name : 'Walk-in'}
                      </div>
                      <span className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                        {order.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="truncate text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
                        {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[11px] text-[#6E6E73] dark:text-[#98989D]">
                        {order.paymentMethod || 'PromptPay'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status, order.paymentStatus)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 inline-block text-[#6E6E73] opacity-60" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Side Sheet */}
      <Sheet
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : ''}
        subtitle={selectedOrder ? formatDateTime(selectedOrder.createdAt) : ''}
        width="md"
        footer={
          selectedOrder && (
            <div className="flex gap-2.5 w-full">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => setIsReceiptModalOpen(true)}
              >
                Receipt
              </Button>

              {selectedOrder.paymentStatus !== 'REFUNDED' && selectedOrder.status !== 'CANCELLED' && (
                <Button
                  variant="destructive"
                  size="md"
                  className="flex-1"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  onClick={() => setIsRefundDialogOpen(true)}
                >
                  Refund
                </Button>
              )}
            </div>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status & Staff Header */}
            <div className="p-3.5 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex justify-between items-center text-xs">
              <div>
                <span className="text-[#6E6E73] dark:text-[#98989D]">Cashier / Staff:</span>
                <p className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {selectedOrder.staffName}
                </p>
              </div>
              <div>
                {getStatusBadge(selectedOrder.status, selectedOrder.paymentStatus)}
              </div>
            </div>

            {/* Customer Details */}
            {selectedOrder.customer && (
              <div className="p-3.5 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.03] space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  Customer Information
                </span>
                <p className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
                  {selectedOrder.customer.name}
                </p>
                <p className="text-[#6E6E73] dark:text-[#98989D]">
                  {selectedOrder.customer.phone} · Loyalty Balance: {selectedOrder.customer.loyaltyPoints} pts
                </p>
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                Ordered Items ({selectedOrder.items.length})
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.03] space-y-1 text-xs"
                  >
                    <div className="flex justify-between font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {item.modifiers.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#98989D]"
                          >
                            {m.optionName} {m.priceDelta > 0 && `(+${formatCurrency(m.priceDelta)})`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 p-4 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.03] text-xs">
              <div className="flex justify-between text-[#6E6E73] dark:text-[#98989D]">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#34C759]">
                  <span>Discount</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              {selectedOrder.tax > 0 && (
                <div className="flex justify-between text-[#6E6E73] dark:text-[#98989D]">
                  <span>VAT ({settings.vatRate}%)</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <span>Total Paid</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Refund info banner if already refunded */}
            {selectedOrder.paymentStatus === 'REFUNDED' && (
              <div className="p-3 rounded-[12px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-xs text-[#FF3B30] space-y-0.5">
                <p className="font-bold">Refund Processed</p>
                <p>Reason: {selectedOrder.refundReason || 'N/A'}</p>
                {selectedOrder.refundedAt && <p>Date: {formatDateTime(selectedOrder.refundedAt)}</p>}
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* ESC/POS Printable Receipt Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Print Receipt"
          maxWidth="sm"
        >
          <ReceiptView order={selectedOrder} settings={settings} />
        </Modal>
      )}

      {/* Confirmation Dialog for Refund */}
      {selectedOrder && (
        <ConfirmDialog
          isOpen={isRefundDialogOpen}
          onClose={() => setIsRefundDialogOpen(false)}
          onConfirm={handleConfirmRefund}
          title="Refund Order"
          description={`Are you sure you want to refund ${selectedOrder.orderNumber} (${formatCurrency(
            selectedOrder.total
          )})? This will reverse the transaction and return ingredients to stock.`}
          confirmLabel="Confirm Refund"
          isDestructive={true}
        />
      )}
    </div>
  );
};
