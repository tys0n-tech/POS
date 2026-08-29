import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SegmentedControl } from '../ui/SegmentedControl';
import { useTableStore } from '../../stores/useTableStore';
import { useCartStore } from '../../stores/useCartStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Table, TableZone } from '../../types';
import { formatCurrency, formatElapsedTime, cn } from '../../utils/format';
import { sound } from '../../utils/audio';
import { 
  Users, 
  Clock, 
  Check, 
  XCircle, 
  Coffee, 
  Sparkles, 
  TreePine, 
  Wine, 
  Crown
} from 'lucide-react';

export interface TableSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable?: (table: Table | null) => void;
}

export const TableSelectModal: React.FC<TableSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectTable
}) => {
  const { tables } = useTableStore();
  const { selectedTableId, setTable, setTableOrPager } = useCartStore();
  const { t } = useTranslation();

  const [activeZone, setActiveZone] = useState<TableZone | 'ALL'>('ALL');

  const filteredTables = tables.filter(
    (tbl) => activeZone === 'ALL' || tbl.zone === activeZone
  );

  const handleSelect = (table: Table) => {
    sound.playClick();
    setTable(table.id, table.name);
    if (onSelectTable) onSelectTable(table);
    onClose();
  };

  const handleClearTable = () => {
    sound.playClick();
    setTable('', '');
    setTableOrPager('');
    if (onSelectTable) onSelectTable(null);
    onClose();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Table & Dine-In Seating"
      subtitle="Select table or floor zone for this order"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Zone Segmented Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <SegmentedControl<TableZone | 'ALL'>
            layoutId="table-modal-zones"
            value={activeZone}
            onChange={setActiveZone}
            size="sm"
            options={[
              { value: 'ALL', label: 'All Zones' },
              { value: 'INDOOR', label: 'Indoor', icon: Coffee },
              { value: 'OUTDOOR', label: 'Outdoor', icon: TreePine },
              { value: 'BAR', label: 'Bar', icon: Wine },
              { value: 'VIP', label: 'VIP', icon: Crown }
            ]}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearTable}
            className="text-xs text-[#FF3B30] hover:bg-[#FF3B30]/10"
          >
            Clear / Pager Mode
          </Button>
        </div>

        {/* Tables Grid */}
        <div className="max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredTables.map((tbl) => {
              const isSelected = selectedTableId === tbl.id;
              const isOccupied = tbl.status === 'OCCUPIED';
              const isReserved = tbl.status === 'RESERVED';
              const ZoneIcon = getZoneIcon(tbl.zone);

              return (
                <motion.button
                  key={tbl.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleSelect(tbl)}
                  className={cn(
                    'p-3 rounded-[16px] border text-left transition-all relative flex flex-col justify-between h-28',
                    isSelected
                      ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] ring-2 ring-[#8B6F5A]/20 shadow-sm'
                      : isOccupied
                      ? 'bg-[#FF9F0A]/5 border-[#FF9F0A]/30 hover:border-[#FF9F0A]/60'
                      : isReserved
                      ? 'bg-[#0071E3]/5 border-[#0071E3]/30 hover:border-[#0071E3]/60'
                      : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                  )}
                >
                  {/* Top line: Table Number + Zone + Capacity */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {tbl.number}
                        </span>
                        <ZoneIcon className="w-3 h-3 text-[#6E6E73] dark:text-[#98989D]" />
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#98989D] flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" />
                        <span>{tbl.capacity}</span>
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                      {tbl.name}
                    </p>
                  </div>

                  {/* Bottom line: Status indicator */}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06]">
                    {isOccupied ? (
                      <>
                        <span className="font-bold text-[#C97B00] dark:text-[#FF9F0A] truncate">
                          {tbl.currentOrderNumber || 'Occupied'}
                        </span>
                        {tbl.seatedAt && (
                          <span className="text-[#6E6E73] dark:text-[#98989D] font-mono flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatElapsedTime(tbl.seatedAt)}
                          </span>
                        )}
                      </>
                    ) : isReserved ? (
                      <span className="font-semibold text-[#0071E3]">
                        Reserved
                      </span>
                    ) : (
                      <span className="font-semibold text-[#34C759]">
                        Available
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#8B6F5A] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
