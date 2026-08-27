import React from 'react';
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
            <button
              key={amt}
              type="button"
              onClick={() => {
                sound.playClick();
                if (onQuickCash) onQuickCash(amt);
                else onChange(amt.toString());
              }}
              className="py-2 px-1 text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-[10px] transition-all active:scale-95"
            >
              ฿{amt}
            </button>
          ))}
        </div>
      )}

      {/* 3x4 Keypad Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {buttons.map((btn, idx) => {
          if (btn === 'DEL') {
            return (
              <button
                key={idx}
                type="button"
                onClick={handleDelete}
                className="h-14 rounded-[14px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center font-medium transition-all active:scale-95 text-lg"
              >
                <Delete className="w-5 h-5 text-[#6E6E73] dark:text-[#98989D]" />
              </button>
            );
          }
          if (btn === 'C') {
            return (
              <button
                key={idx}
                type="button"
                onClick={handleClear}
                className="h-14 rounded-[14px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#6E6E73] dark:text-[#98989D] flex items-center justify-center font-semibold transition-all active:scale-95 text-base"
              >
                Clear
              </button>
            );
          }
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDigit(btn)}
              className="h-14 rounded-[14px] bg-black/[0.03] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-xl flex items-center justify-center transition-all active:scale-95"
            >
              {btn}
            </button>
          );
        })}
      </div>

      {onConfirm && (
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onConfirm();
          }}
          disabled={!value || value === '0'}
          className="mt-1 w-full h-13 py-3.5 bg-[#1D1D1F] text-white hover:bg-[#2C2C2E] active:bg-[#000000] dark:bg-[#F5F5F7] dark:text-[#1D1D1F] rounded-[14px] font-semibold text-sm transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99] shadow-sm"
        >
          {confirmLabel}
        </button>
      )}
    </div>
  );
};
