import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTableStore } from '../stores/useTableStore';
import { useCartStore } from '../stores/useCartStore';
import { useToastStore } from '../stores/useToastStore';
import { useTranslation } from '../hooks/useTranslation';
import { Table, TableZone, TableStatus } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { formatCurrency, formatElapsedTime, cn } from '../utils/format';
import { sound } from '../utils/audio';
import {
  Users,
  Clock,
  Coffee,
  TreePine,
  Wine,
  Crown,
  ArrowRightLeft,
  CheckCircle,
  Plus,
  Receipt,
  Sparkles,
  CalendarCheck,
  RotateCcw
} from 'lucide-react';

export const TablesPage: React.FC = () => {
  const {
    tables,
    selectedZone,
    setSelectedZone,
    occupyTable,
    releaseTable,
    updateTableStatus,
    transferTable
  } = useTableStore();
  const { setTable, setOrderType } = useCartStore();
  const { showToast } = useToastStore();
  const { t } = useTranslation();

  const [, setTimerTick] = useState(0);
  const [transferSource, setTransferSource] = useState<Table | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');

  // Live timer tick every 5 seconds for elapsed table seated times
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick((tick) => tick + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredTables = tables.filter(
    (tbl) => selectedZone === 'ALL' || tbl.zone === selectedZone
  );

  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED');
  const reservedTables = tables.filter((t) => t.status === 'RESERVED');
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');
  const totalDineInRevenue = occupiedTables.reduce((sum, t) => sum + (t.currentBillAmount || 0), 0);
  const totalGuests = occupiedTables.reduce((sum, t) => sum + (t.guestCount || 0), 0);
  const occupancyRate = totalTables > 0 ? Math.round((occupiedTables.length / totalTables) * 100) : 0;

  const handleQuickRelease = (table: Table) => {
    sound.playSuccess();
    releaseTable(table.id);
    showToast({
      type: 'info',
      title: 'Table Cleared',
      message: `${table.name} (${table.number}) is now Available`
    });
  };

  const handleToggleReserve = (table: Table) => {
    sound.playClick();
    if (table.status === 'RESERVED') {
      updateTableStatus(table.id, 'AVAILABLE');
      showToast({ type: 'info', title: 'Reservation Cancelled', message: `${table.name} is now Available` });
    } else {
      updateTableStatus(table.id, 'RESERVED');
      showToast({ type: 'success', title: 'Table Reserved', message: `${table.name} is now marked Reserved` });
    }
  };

  const handleOpenTransferModal = (table: Table) => {
    sound.playClick();
    setTransferSource(table);
    const firstAvailable = tables.find((t) => t.id !== table.id && t.status === 'AVAILABLE');
    setTransferTargetId(firstAvailable ? firstAvailable.id : '');
  };

  const handleExecuteTransfer = () => {
    if (!transferSource || !transferTargetId) return;
    const res = transferTable(transferSource.id, transferTargetId);
    if (res.success) {
      sound.playSuccess();
      const targetTable = tables.find((t) => t.id === transferTargetId);
      showToast({
        type: 'success',
        title: 'Table Transferred',
        message: `Transferred ${transferSource.name} ➔ ${targetTable?.name}`
      });
      setTransferSource(null);
    } else {
      sound.playError();
      showToast({ type: 'error', title: 'Transfer Failed', message: res.message });
    }
  };

  const getZoneIcon = (zone: TableZone) => {
    switch (zone) {
      case 'INDOOR':
        return Coffee;
      case 'OUTDOOR':
        return TreePine;
      case 'BAR':
        return Wine;
      case 'VIP':
        return Crown;
      default:
        return Coffee;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 select-none">
      {/* Top Header & Stats Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Table & Floor Plan Management
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Live floor occupancy, table assignment, and seating zones
          </p>
        </div>

        {/* Key KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="px-3.5 py-2 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider block">
              Occupancy
            </span>
            <span className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {occupancyRate}% ({occupiedTables.length}/{totalTables})
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-[14px] bg-[#34C759]/10 border border-[#34C759]/20">
            <span className="text-[10px] font-semibold text-[#34C759] uppercase tracking-wider block">
              Available
            </span>
            <span className="text-base font-bold text-[#34C759]">
              {availableTables.length} Tables
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-[14px] bg-[#FF9F0A]/10 border border-[#FF9F0A]/20">
            <span className="text-[10px] font-semibold text-[#FF9F0A] uppercase tracking-wider block">
              Seated Guests
            </span>
            <span className="text-base font-bold text-[#FF9F0A]">
              {totalGuests} Guests
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-[14px] bg-[#8B6F5A]/10 border border-[#8B6F5A]/20">
            <span className="text-[10px] font-semibold text-[#8B6F5A] dark:text-[#D4BBA5] uppercase tracking-wider block">
              Active Dine-In
            </span>
            <span className="text-base font-bold text-[#8B6F5A] dark:text-[#D4BBA5]">
              {formatCurrency(totalDineInRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Zone Segmented Filter Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
        <SegmentedControl<TableZone | 'ALL'>
          layoutId="tables-page-zone-toggle"
          value={selectedZone}
          onChange={setSelectedZone}
          size="sm"
          options={[
            { value: 'ALL', label: 'All Floor Zones' },
            { value: 'INDOOR', label: 'Indoor Hall', icon: Coffee },
            { value: 'OUTDOOR', label: 'Outdoor Garden', icon: TreePine },
            { value: 'BAR', label: 'Bar Counter', icon: Wine },
            { value: 'VIP', label: 'VIP Lounge', icon: Crown }
          ]}
        />
      </div>

      {/* Table Cards Visual Floor Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {filteredTables.map((table) => {
            const isOccupied = table.status === 'OCCUPIED';
            const isReserved = table.status === 'RESERVED';
            const ZoneIcon = getZoneIcon(table.zone);

            return (
              <div
                key={table.id}
                className={cn(
                  'p-4 rounded-[20px] border flex flex-col justify-between transition-all bg-white dark:bg-[#1C1C1E] shadow-sm hover:shadow-md relative h-48',
                  isOccupied
                    ? 'border-[#FF9F0A]/40 ring-1 ring-[#FF9F0A]/20'
                    : isReserved
                    ? 'border-[#0071E3]/40 ring-1 ring-[#0071E3]/20'
                    : 'border-black/[0.06] dark:border-white/[0.08]'
                )}
              >
                {/* Card Top: Number + Zone + Capacity + Status Pill */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {table.number}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                        <ZoneIcon className="w-3 h-3" />
                        <span>{table.zone}</span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        isOccupied
                          ? 'bg-[#FF9F0A]/15 text-[#C97B00] dark:text-[#FF9F0A]'
                          : isReserved
                          ? 'bg-[#0071E3]/15 text-[#0071E3]'
                          : 'bg-[#34C759]/15 text-[#34C759]'
                      )}
                    >
                      {table.status}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {table.name}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-[#6E6E73] dark:text-[#98989D] mt-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Capacity: {table.capacity} Seats</span>
                    {table.guestCount && isOccupied && (
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        · {table.guestCount} Seated
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Middle: Active Order / Seated Time */}
                {isOccupied && (
                  <div className="py-2 px-3 rounded-[12px] bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 flex items-center justify-between text-xs my-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      <Receipt className="w-3.5 h-3.5 text-[#FF9F0A]" />
                      <span>{table.currentOrderNumber || 'Active Bill'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                        {formatCurrency(table.currentBillAmount || 0)}
                      </span>
                      {table.seatedAt && (
                        <span className="text-[10px] font-mono text-[#6E6E73] dark:text-[#98989D] flex items-center gap-0.5 justify-end">
                          <Clock className="w-2.5 h-2.5" />
                          {formatElapsedTime(table.seatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Bottom: Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                  {isOccupied ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<ArrowRightLeft className="w-3 h-3" />}
                        onClick={() => handleOpenTransferModal(table)}
                        className="flex-1 text-xs"
                      >
                        Transfer
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<CheckCircle className="w-3 h-3" />}
                        onClick={() => handleQuickRelease(table)}
                        className="text-xs text-[#FF3B30] hover:bg-[#FF3B30]/10"
                      >
                        Clear
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant={isReserved ? 'destructive' : 'secondary'}
                        size="sm"
                        leftIcon={<CalendarCheck className="w-3 h-3" />}
                        onClick={() => handleToggleReserve(table)}
                        className="flex-1 text-xs"
                      >
                        {isReserved ? 'Cancel' : 'Reserve'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer Table Modal */}
      <Modal
        isOpen={!!transferSource}
        onClose={() => setTransferSource(null)}
        title="Transfer Table Order"
        subtitle={transferSource ? `Move ${transferSource.name} (${transferSource.currentOrderNumber || 'Order'}) to another table` : ''}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-2">
              Select Destination Table
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {tables
                .filter((t) => t.id !== transferSource?.id && t.status === 'AVAILABLE')
                .map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setTransferTargetId(target.id)}
                    className={cn(
                      'p-3 rounded-[12px] border text-left text-xs transition-all',
                      transferTargetId === target.id
                        ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] text-[#8B6F5A] ring-1 ring-[#8B6F5A]'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/10 hover:border-black/20'
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{target.number}</span>
                      <span className="text-[10px] text-[#6E6E73]">{target.zone}</span>
                    </div>
                    <p className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {target.name}
                    </p>
                    <span className="text-[10px] text-[#34C759] font-medium">Available ({target.capacity} seats)</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setTransferSource(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!transferTargetId}
              onClick={handleExecuteTransfer}
            >
              Confirm Transfer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
