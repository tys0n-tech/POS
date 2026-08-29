import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency, cn } from '../../utils/format';
import { sound } from '../../utils/audio';
import { Users, DollarSign, Calculator, Split, Check } from 'lucide-react';

export interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  totalAmount
}) => {
  const [splitCount, setSplitCount] = useState(2);
  const [paidGuests, setPaidGuests] = useState<number[]>([]);

  const perPerson = Math.ceil(totalAmount / splitCount);

  const togglePaid = (guestIndex: number) => {
    sound.playClick();
    if (paidGuests.includes(guestIndex)) {
      setPaidGuests(paidGuests.filter((i) => i !== guestIndex));
    } else {
      setPaidGuests([...paidGuests, guestIndex]);
    }
  };

  const handleSelectCount = (count: number) => {
    sound.playClick();
    setSplitCount(count);
    setPaidGuests([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Split Bill Calculator"
      subtitle={`Total Bill: ${formatCurrency(totalAmount)}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Split Count Selector Presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-2">
            Number of Guests
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleSelectCount(count)}
                className={cn(
                  'py-2.5 rounded-[12px] border text-xs font-bold transition-all flex flex-col items-center gap-0.5',
                  splitCount === count
                    ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] text-[#8B6F5A] dark:text-[#D4BBA5] ring-1 ring-[#8B6F5A]'
                    : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/10 dark:border-white/10 text-[#6E6E73] hover:bg-black/[0.05]'
                )}
              >
                <span className="text-base">{count}</span>
                <span className="text-[10px] font-normal opacity-70">Guests</span>
              </button>
            ))}
          </div>
        </div>

        {/* Per Person Amount Display Banner */}
        <div className="p-4 rounded-[18px] bg-[#8B6F5A]/10 border border-[#8B6F5A]/20 text-center space-y-1">
          <span className="text-xs font-semibold text-[#8B6F5A] dark:text-[#D4BBA5] uppercase tracking-wider">
            Each Person Pays
          </span>
          <p className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {formatCurrency(perPerson)}
          </p>
          <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
            {splitCount} x {formatCurrency(perPerson)} = {formatCurrency(perPerson * splitCount)}
          </p>
        </div>

        {/* Guest Payment Checklist */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-1">
            Collection Checklist ({paidGuests.length}/{splitCount} Collected)
          </label>
          {Array.from({ length: splitCount }).map((_, idx) => {
            const isCollected = paidGuests.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => togglePaid(idx)}
                className={cn(
                  'w-full flex items-center justify-between p-2.5 rounded-[12px] border text-xs transition-all',
                  isCollected
                    ? 'bg-[#34C759]/10 border-[#34C759] text-[#1D1D1F] dark:text-[#F5F5F7]'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/10 text-[#6E6E73]'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      isCollected
                        ? 'bg-[#34C759] text-white'
                        : 'bg-black/5 dark:bg-white/10 text-[#6E6E73]'
                    )}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Guest {idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-semibold">
                  <span>{formatCurrency(perPerson)}</span>
                  {isCollected ? (
                    <span className="text-[10px] bg-[#34C759] text-white px-2 py-0.5 rounded-full">
                      Paid
                    </span>
                  ) : (
                    <span className="text-[10px] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-[#6E6E73]">
                      Unpaid
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
