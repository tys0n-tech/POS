import React from 'react';
import { motion } from 'framer-motion';
import { sound } from '../../utils/audio';
import { Delete } from 'lucide-react';
import { cn } from '../../utils/format';

export interface KeypadProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  maxDigits?: number;
  allowDecimals?: boolean;
  className?: string;
  quickCashAmounts?: number[];
  onQuickCash?: (amount: number) => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  value,
  onChange,
  onConfirm,
  confirmLabel = 'Confirm',
  maxDigits = 10,
  allowDecimals = false,
  className,
  quickCashAmounts,
  onQuickCash
}) => {
  const handleDigit = (digit: string) => {
    sound.playClick();
    if (digit === '.' && !allowDecimals) return;
    if (digit === '.' && value.includes('.')) return;
    if (value.length >= maxDigits) return;

    if (value === '0' && digit !== '.') {
      onChange(digit);
    } else {
      onChange(value + digit);
    }
  };

  const handleDelete = () => {
    sound.playClick();
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    sound.playClick();
    onChange('');
  };

  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', allowDecimals ? '.' : 'C', '0', 'DEL'];

  return (
    <div className={cn('flex flex-col gap-3 select-none', className)}>
      {/* Quick Cash Presets (if provided) */}
      {quickCashAmounts && quickCashAmounts.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-1">
          {quickCashAmounts.map((amt) => (
            <motion.button
              key={amt}
              whileTap={{ scale: 0.93 }}
              type="button"
              onClick={() => {
                sound.playClick();
                if (onQuickCash) onQuickCash(amt);
                else onChange(amt.toString());
              }}
              className="py-2 px-1 text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-[10px] transition-colors shadow-xs"
            >
              ฿{amt}
            </motion.button>
          ))}
        </div>
      )}

      {/* 3x4 Keypad Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {buttons.map((btn, idx) => {
          if (btn === 'DEL') {
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={handleDelete}
                className="h-14 rounded-[14px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center font-medium transition-colors shadow-xs text-lg"
              >
                <Delete className="w-5 h-5 text-[#6E6E73] dark:text-[#98989D]" />
              </motion.button>
            );
          }
          if (btn === 'C') {
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={handleClear}
                className="h-14 rounded-[14px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#6E6E73] dark:text-[#98989D] flex items-center justify-center font-semibold transition-colors shadow-xs text-base"
              >
                C
              </motion.button>
            );
          }
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => handleDigit(btn)}
              className="h-14 rounded-[14px] bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[#1D1D1F] dark:text-[#F5F5F7] text-xl font-bold flex items-center justify-center shadow-xs transition-colors"
            >
              {btn}
            </motion.button>
          );
        })}
      </div>

      {onConfirm && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => {
            sound.playSuccess();
            onConfirm();
          }}
          className="w-full py-3.5 mt-1 rounded-[14px] bg-[#8B6F5A] hover:bg-[#7A5F4B] text-white font-bold text-sm shadow-md transition-colors"
        >
          {confirmLabel}
        </motion.button>
      )}
    </div>
  );
};
