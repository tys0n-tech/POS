import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Keypad } from '../ui/Keypad';
import { useShiftStore } from '../../stores/useShiftStore';
import { useStaffStore } from '../../stores/useStaffStore';
import { useToastStore } from '../../stores/useToastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { DollarSign, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/audio';

export const ShiftDrawerModal: React.FC = () => {
  const { currentShift, isShiftDrawerOpen, setShiftDrawerOpen, openShift, addCashEntry, closeShift } = useShiftStore();
  const { currentStaff } = useStaffStore();
  const { showToast } = useToastStore();

  const [mode, setMode] = useState<'OVERVIEW' | 'OPEN' | 'CASH_IN' | 'CASH_OUT' | 'CLOSE'>('OVERVIEW');
  const [amountInput, setAmountInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [closeActualCash, setCloseActualCash] = useState('');
  const [closeNote, setCloseNote] = useState('');

  const handleClose = () => {
    setMode('OVERVIEW');
    setAmountInput('');
    setReasonInput('');
    setCloseActualCash('');
    setCloseNote('');
    setShiftDrawerOpen(false);
  };

  const handleOpenShift = () => {
    const float = parseFloat(amountInput) || 0;
    openShift(currentStaff.id, currentStaff.name, float);
    sound.playSuccess();
    showToast({ type: 'success', title: 'Shift Opened', message: `Starting float: ${formatCurrency(float)}` });
    handleClose();
  };

  const handleAddCashIn = () => {
    const amt = parseFloat(amountInput) || 0;
    if (amt <= 0) return;
    addCashEntry('CASH_IN', amt, reasonInput || 'Cash Deposit / Float Top-up', currentStaff.name);
    sound.playSuccess();
    showToast({ type: 'success', title: 'Cash In Recorded', message: formatCurrency(amt) });
    setMode('OVERVIEW');
    setAmountInput('');
    setReasonInput('');
  };

  const handleAddCashOut = () => {
    const amt = parseFloat(amountInput) || 0;
    if (amt <= 0) return;
    addCashEntry('CASH_OUT', amt, reasonInput || 'Petty Cash Payout', currentStaff.name);
    sound.playSuccess();
    showToast({ type: 'warning', title: 'Cash Out Recorded', message: formatCurrency(amt) });
    setMode('OVERVIEW');
    setAmountInput('');
    setReasonInput('');
  };

  const handleCloseShift = () => {
    const actual = parseFloat(closeActualCash) || 0;
    const { difference } = closeShift(actual, closeNote);
    sound.playSuccess();
    showToast({
      type: difference === 0 ? 'success' : 'warning',
      title: 'Shift Closed & Balanced',
      message: `Actual: ${formatCurrency(actual)} | Diff: ${formatCurrency(difference)}`
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isShiftDrawerOpen}
      onClose={handleClose}
      title="Cash Register & Shift"
      subtitle={currentShift ? `Active Shift: ${currentShift.registerName}` : 'No active shift'}
      maxWidth="md"
    >
      {mode === 'OVERVIEW' && (
        <div className="space-y-5">
          {currentShift && currentShift.status === 'OPEN' ? (
            <>
              {/* Shift Stats Card */}
              <div className="p-4 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <div className="flex justify-between items-center text-xs text-[#6E6E73] dark:text-[#98989D]">
                  <span>Started: {formatDateTime(currentShift.startTime)}</span>
                  <span>Cashier: {currentShift.staffName}</span>
                </div>

                <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <p className="text-[11px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
                    Expected Cash in Drawer
                  </p>
                  <p className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-0.5">
                    {formatCurrency(currentShift.expectedCash)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-black/[0.04] dark:border-white/[0.06]">
                  <div>
                    <span className="text-[#6E6E73] dark:text-[#98989D]">Opening Float:</span>
                    <p className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {formatCurrency(currentShift.startingCash)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6E6E73] dark:text-[#98989D]">Cash Sales:</span>
                    <p className="font-semibold text-[#34C759]">
                      +{formatCurrency(currentShift.cashSales)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6E6E73] dark:text-[#98989D]">Digital / PromptPay:</span>
                    <p className="font-semibold text-[#0071E3]">
                      +{formatCurrency(currentShift.digitalSales)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6E6E73] dark:text-[#98989D]">Cash Out / Drops:</span>
                    <p className="font-semibold text-[#FF9F0A]">
                      -{formatCurrency(currentShift.cashOut)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setMode('CASH_IN');
                    setAmountInput('');
                  }}
                  leftIcon={<ArrowDownRight className="w-4 h-4 text-[#34C759]" />}
                >
                  Cash In
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setMode('CASH_OUT');
                    setAmountInput('');
                  }}
                  leftIcon={<ArrowUpRight className="w-4 h-4 text-[#FF9F0A]" />}
                >
                  Cash Out
                </Button>
                <Button
                  variant="destructive"
                  size="md"
                  onClick={() => {
                    setMode('CLOSE');
                    setCloseActualCash(currentShift.expectedCash.toString());
                  }}
                >
                  Close Shift
                </Button>
              </div>

              {/* Recent Drawer Transactions */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
                  Cash Logs ({currentShift.cashEntries.length})
                </h4>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {currentShift.cashEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2 rounded-[10px] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {entry.reason}
                        </span>
                        <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                          {formatDateTime(entry.timestamp)} · {entry.staffName}
                        </p>
                      </div>
                      <span
                        className={`font-semibold ${
                          entry.type === 'CASH_IN' || entry.type === 'SALE'
                            ? 'text-[#34C759]'
                            : 'text-[#FF3B30]'
                        }`}
                      >
                        {entry.type === 'CASH_IN' || entry.type === 'SALE' ? '+' : '-'}
                        {formatCurrency(entry.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#8B6F5A]/10 text-[#8B6F5A] flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Register is currently closed
                </h4>
                <p className="text-xs text-[#6E6E73] dark:text-[#98989D] max-w-xs mx-auto mt-1">
                  Open a new shift and specify your starting float cash to begin processing orders.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setMode('OPEN');
                  setAmountInput('2000');
                }}
              >
                Open Register Shift
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mode: Open Shift */}
      {mode === 'OPEN' && (
        <div className="space-y-4">
          <Input
            label="Starting Float Cash (THB)"
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="e.g. 2000"
          />
          <Keypad
            value={amountInput}
            onChange={setAmountInput}
            quickCashAmounts={[1000, 2000, 3000, 5000]}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setMode('OVERVIEW')}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleOpenShift}>
              Confirm Open Shift
            </Button>
          </div>
        </div>
      )}

      {/* Mode: Cash In */}
      {mode === 'CASH_IN' && (
        <div className="space-y-4">
          <Input
            label="Cash In Amount (THB)"
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="e.g. 500"
          />
          <Input
            label="Reason / Note"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="e.g. Added change coins / cash deposit"
          />
          <Keypad value={amountInput} onChange={setAmountInput} quickCashAmounts={[100, 200, 500, 1000]} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setMode('OVERVIEW')}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleAddCashIn}>
              Add Cash In
            </Button>
          </div>
        </div>
      )}

      {/* Mode: Cash Out */}
      {mode === 'CASH_OUT' && (
        <div className="space-y-4">
          <Input
            label="Cash Out Amount (THB)"
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="e.g. 200"
          />
          <Input
            label="Reason / Note"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="e.g. Ice delivery / Milk supply reimbursement"
          />
          <Keypad value={amountInput} onChange={setAmountInput} quickCashAmounts={[50, 100, 200, 500]} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setMode('OVERVIEW')}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleAddCashOut}>
              Confirm Cash Out
            </Button>
          </div>
        </div>
      )}

      {/* Mode: Close Shift */}
      {mode === 'CLOSE' && currentShift && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04] space-y-1">
            <div className="flex justify-between text-xs text-[#6E6E73] dark:text-[#98989D]">
              <span>System Expected Cash:</span>
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {formatCurrency(currentShift.expectedCash)}
              </span>
            </div>
            {closeActualCash && (
              <div className="flex justify-between text-xs pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span>Variance (Diff):</span>
                <span
                  className={`font-bold ${
                    parseFloat(closeActualCash) - currentShift.expectedCash === 0
                      ? 'text-[#34C759]'
                      : 'text-[#FF3B30]'
                  }`}
                >
                  {formatCurrency(parseFloat(closeActualCash) - currentShift.expectedCash)}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Actual Counted Cash (THB)"
            type="number"
            value={closeActualCash}
            onChange={(e) => setCloseActualCash(e.target.value)}
            placeholder="Enter physical cash in drawer"
          />

          <Input
            label="Shift Close Notes"
            value={closeNote}
            onChange={(e) => setCloseNote(e.target.value)}
            placeholder="Optional notes or remarks"
          />

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setMode('OVERVIEW')}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleCloseShift}>
              Complete & Close Shift
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
