import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Keypad } from '../ui/Keypad';
import { useStaffStore } from '../../stores/useStaffStore';
import { useToastStore } from '../../stores/useToastStore';
import { sound } from '../../utils/audio';

export const StaffPinModal: React.FC = () => {
  const { isPinModalOpen, setPinModalOpen, switchStaffWithPin, staffList, currentStaff } = useStaffStore();
  const { showToast } = useToastStore();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentStaff.id);

  const handleClose = () => {
    setPin('');
    setErrorMsg('');
    setPinModalOpen(false);
  };

  const handlePinSubmit = () => {
    const res = switchStaffWithPin(pin);
    if (res.success) {
      sound.playSuccess();
      showToast({ type: 'success', title: 'Staff Switched', message: `Welcome, ${currentStaff.name}` });
      handleClose();
    } else {
      sound.playError();
      setErrorMsg(res.message || 'Incorrect PIN');
      setPin('');
    }
  };

  return (
    <Modal
      isOpen={isPinModalOpen}
      onClose={handleClose}
      title="Staff Authentication"
      subtitle="Enter your 4-digit PIN to switch account"
      maxWidth="sm"
    >
      <div className="flex flex-col items-center gap-5">
        {/* Staff selector avatars */}
        <div className="flex items-center justify-center gap-3 w-full py-1 overflow-x-auto">
          {staffList.map((s) => {
            const isSelected = selectedStaffId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedStaffId(s.id);
                  setErrorMsg('');
                  setPin('');
                }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-[14px] transition-all ${
                  isSelected
                    ? 'bg-[#8B6F5A]/15 ring-2 ring-[#8B6F5A]'
                    : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] opacity-70'
                }`}
              >
                {s.avatar ? (
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#8B6F5A]/20 text-[#8B6F5A] font-semibold text-sm flex items-center justify-center">
                    {s.name.charAt(0)}
                  </div>
                )}
                <span className="text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* PIN Circles Display */}
        <div className="flex items-center gap-3 my-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-[#8B6F5A] scale-110'
                    : 'bg-black/10 dark:bg-white/20'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs font-medium text-[#FF3B30] animate-shake">
            {errorMsg}
          </p>
        )}

        <div className="w-full">
          <Keypad
            value={pin}
            onChange={(val) => {
              setErrorMsg('');
              setPin(val);
              if (val.length === 4) {
                setTimeout(() => {
                  const res = switchStaffWithPin(val);
                  if (res.success) {
                    sound.playSuccess();
                    showToast({
                      type: 'success',
                      title: 'Staff Switched',
                      message: `Active user updated`
                    });
                    handleClose();
                  } else {
                    sound.playError();
                    setErrorMsg('Invalid PIN. Please try again.');
                    setPin('');
                  }
                }, 100);
              }
            }}
            maxDigits={4}
          />
        </div>

        <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] text-center">
          Demo PINs: Tyson (1234), Sarah (0000), Liam (1111), Elena (9999)
        </p>
      </div>
    </Modal>
  );
};
