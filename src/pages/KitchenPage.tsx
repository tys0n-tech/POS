import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../stores/useOrderStore';
import { Order, OrderStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatElapsedTime, formatTime, cn } from '../utils/format';
import { sound } from '../utils/audio';
import { 
  ChefHat, 
  Clock, 
  Check, 
  Play, 
  Bell, 
  Coffee, 
  ShoppingBag,
  Sparkles,
  Volume2
} from 'lucide-react';

export const KitchenPage: React.FC = () => {
  const { orders, updateOrderStatus } = useOrderStore();
  const [timeTick, setTimeTick] = useState(0);

  // Timer update tick every second to keep elapsed timers accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const newOrders = orders.filter((o) => o.status === 'NEW');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  const handleStartPreparing = (orderId: string) => {
    sound.playClick();
    updateOrderStatus(orderId, 'PREPARING');
  };

  const handleMarkReady = (orderId: string) => {
    sound.playKitchenBell();
    updateOrderStatus(orderId, 'READY');
  };

  const handleCompleteOrder = (orderId: string) => {
    sound.playSuccess();
    updateOrderStatus(orderId, 'COMPLETED');
  };

  const renderOrderCard = (order: Order, columnStatus: OrderStatus) => {
    const isUrgent =
      columnStatus !== 'READY' &&
      Date.now() - new Date(order.createdAt).getTime() > 600000; // > 10 mins

    return (
      <div
        key={order.id}
        className={cn(
          'p-4 rounded-[18px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border transition-all duration-200 flex flex-col justify-between shadow-sm select-none',
          isUrgent
            ? 'border-[#FF9F0A] ring-1 ring-[#FF9F0A]/30'
            : 'border-black/[0.06] dark:border-white/[0.08]'
        )}
      >
        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {order.orderNumber}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-semibold text-[#6E6E73] dark:text-[#98989D]">
                {order.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}
              </span>
            </div>

            {/* Elapsed Time */}
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full',
                isUrgent
                  ? 'bg-[#FF9F0A]/15 text-[#FF9F0A]'
                  : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#98989D]'
              )}
            >
              <Clock className="w-3 h-3" />
              <span>{formatElapsedTime(order.createdAt)}</span>
            </div>
          </div>

          {/* Customer / Table info */}
          <div className="flex justify-between text-[11px] text-[#6E6E73] dark:text-[#98989D] mb-3">
            <span>{order.customer ? order.customer.name : 'Walk-in'}</span>
            {order.tableOrPager && <span className="font-semibold">{order.tableOrPager}</span>}
          </div>

          {/* Items & Modifiers */}
          <div className="space-y-2.5 mb-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.03] text-xs space-y-1"
              >
                <div className="flex justify-between font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                </div>

                {/* Modifiers highlighted for baristas */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {item.modifiers.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="text-[10px] px-1.5 py-0.5 rounded-[6px] bg-[#8B6F5A]/15 dark:bg-[#8B6F5A]/25 text-[#684F3D] dark:text-[#D4BBA5] font-medium"
                      >
                        {m.optionName}
                      </span>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <p className="text-[10px] italic text-[#FF9F0A] pt-0.5">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div>
          {columnStatus === 'NEW' && (
            <Button
              variant="tonal"
              size="md"
              className="w-full"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={() => handleStartPreparing(order.id)}
            >
              Start Preparing
            </Button>
          )}

          {columnStatus === 'PREPARING' && (
            <Button
              variant="primary"
              size="md"
              className="w-full bg-[#34C759] hover:bg-[#2EB04F] text-white"
              leftIcon={<Bell className="w-4 h-4" />}
              onClick={() => handleMarkReady(order.id)}
            >
              Mark Ready
            </Button>
          )}

          {columnStatus === 'READY' && (
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              leftIcon={<Check className="w-4 h-4" />}
              onClick={() => handleCompleteOrder(order.id)}
            >
              Serve & Complete
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Kitchen Display System (KDS)
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Live order queue for espresso bar and bakery station
          </p>
        </div>

        <button
          type="button"
          onClick={() => sound.playKitchenBell()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]"
        >
          <Bell className="w-3.5 h-3.5 text-[#8B6F5A]" />
          <span>Test Bar Bell</span>
        </button>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* COLUMN 1: NEW */}
        <div className="flex flex-col h-full bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-3 border border-black/[0.04] dark:border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0071E3]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7]">
                New Orders
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0071E3]/15 text-[#0071E3]">
              {newOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {newOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-[#6E6E73] dark:text-[#98989D]">
                No pending new orders
              </div>
            ) : (
              newOrders.map((o) => renderOrderCard(o, 'NEW'))
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="flex flex-col h-full bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-3 border border-black/[0.04] dark:border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF9F0A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7]">
                Preparing
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A]">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {preparingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-[#6E6E73] dark:text-[#98989D]">
                No orders currently in prep
              </div>
            ) : (
              preparingOrders.map((o) => renderOrderCard(o, 'PREPARING'))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY */}
        <div className="flex flex-col h-full bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-3 border border-black/[0.04] dark:border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34C759]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7]">
                Ready for Pickup
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {readyOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-[#6E6E73] dark:text-[#98989D]">
                No orders ready for pickup
              </div>
            ) : (
              readyOrders.map((o) => renderOrderCard(o, 'READY'))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
