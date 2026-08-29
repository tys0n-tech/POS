import React, { useState } from 'react';
import { useOrderStore } from '../stores/useOrderStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useShiftStore } from '../stores/useShiftStore';
import { useProductStore } from '../stores/useProductStore';
import { useToastStore } from '../stores/useToastStore';
import { useTranslation } from '../hooks/useTranslation';
import { Order, OrderStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Sheet } from '../components/ui/Sheet';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { SearchInput } from '../components/ui/SearchInput';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { formatCurrency, formatDateTime, formatTime, cn } from '../utils/format';
import { sound } from '../utils/audio';
import { 
  ShoppingBag, 
  Printer, 
  RotateCcw, 
  ChevronRight
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    refundOrder,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery
  } = useOrderStore();

  const { settings } = useSettingsStore();
  const { restockRecipeItems } = useInventoryStore();
  const { recordRefund } = useShiftStore();
  const { products } = useProductStore();
  const { showToast } = useToastStore();
  const { t } = useTranslation();

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
        title: t('orders.refund'),
        message: `${selectedOrder.orderNumber} - ${formatCurrency(selectedOrder.total)}`
      });
      setIsRefundDialogOpen(false);
    }
  };

  const getStatusBadge = (status: OrderStatus, paymentStatus: string) => {
    if (paymentStatus === 'REFUNDED') {
      return <Badge variant="error" dot>{t('status.cancelled')}</Badge>;
    }
    switch (status) {
      case 'NEW':
        return <Badge variant="blue" dot>{t('status.new')}</Badge>;
      case 'PREPARING':
        return <Badge variant="warning" dot>{t('status.preparing')}</Badge>;
      case 'READY':
        return <Badge variant="coffee" dot>{t('status.ready')}</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" dot>{t('status.completed')}</Badge>;
      case 'CANCELLED':
        return <Badge variant="error" dot>{t('status.cancelled')}</Badge>;
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
            {t('orders.title')}
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            {orders.length} {t('pos.items')}
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-56">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder={t('orders.searchPlaceholder')}
            />
          </div>

          {/* Status Filter Pills */}
          <SegmentedControl<string>
            layoutId="orders-status-tabs"
            value={statusFilter}
            onChange={setStatusFilter}
            size="sm"
            options={['ALL', 'NEW', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => ({
              value: st,
              label: st === 'ALL' ? t('categories.all') : t(`status.${st.toLowerCase()}`)
            }))}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#98989D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">{t('receipt.receiptNo')}</th>
                <th className="py-3.5 px-4">{t('receipt.time')}</th>
                <th className="py-3.5 px-4">{t('nav.customers')}</th>
                <th className="py-3.5 px-4">{t('receipt.item')}</th>
                <th className="py-3.5 px-4">{t('receipt.total')}</th>
                <th className="py-3.5 px-4">{t('receipt.paymentMethod')}</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-[#6E6E73] dark:text-[#98989D]">
                    No orders found
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
                        {order.orderType === 'DINE_IN' ? t('pos.dineIn') : t('pos.takeaway')}
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
        title={selectedOrder ? `${t('receipt.receiptNo')} ${selectedOrder.orderNumber}` : ''}
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
                {t('receipt.printButton')}
              </Button>

              {selectedOrder.paymentStatus !== 'REFUNDED' && selectedOrder.status !== 'CANCELLED' && (
                <Button
                  variant="destructive"
                  size="md"
                  className="flex-1"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  onClick={() => setIsRefundDialogOpen(true)}
                >
                  {t('orders.refund')}
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
                <span className="text-[#6E6E73] dark:text-[#98989D]">{t('receipt.cashier')}:</span>
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
                  {t('nav.customers')}
                </span>
                <p className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
                  {selectedOrder.customer.name}
                </p>
                <p className="text-[#6E6E73] dark:text-[#98989D]">
                  {selectedOrder.customer.phone} · {t('pos.points')}: {selectedOrder.customer.loyaltyPoints}
                </p>
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                {t('receipt.item')} ({selectedOrder.items.length})
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
                <span>{t('receipt.subtotal')}</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#34C759]">
                  <span>{t('receipt.discount')}</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              {selectedOrder.tax > 0 && (
                <div className="flex justify-between text-[#6E6E73] dark:text-[#98989D]">
                  <span>{t('receipt.vatIncluded')}</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <span>{t('receipt.total')}</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* Full Thermal Receipt Modal */}
      {selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}

      {/* Confirmation Dialog for Refund */}
      {selectedOrder && (
        <ConfirmDialog
          isOpen={isRefundDialogOpen}
          onClose={() => setIsRefundDialogOpen(false)}
          onConfirm={handleConfirmRefund}
          title={t('orders.refund')}
          description={`${t('orders.refund')} ${selectedOrder.orderNumber} (${formatCurrency(
            selectedOrder.total
          )})?`}
          confirmLabel={t('orders.refund')}
          isDestructive={true}
        />
      )}
    </div>
  );
};
