import React, { useState, useEffect } from 'react';
import { useStaffStore } from '../stores/useStaffStore';
import { useToastStore } from '../stores/useToastStore';
import { sound } from '../utils/audio';
import { Coffee, Delete, Shield, User } from 'lucide-react';
import { cn } from '../utils/format';

export const LoginPage: React.FC = () => {
  const { staffList, currentStaff, loginWithPin, pinTargetStaffId } = useStaffStore();
  const { showToast } = useToastStore();

  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    pinTargetStaffId || currentStaff.id || staffList[0]?.id || 'staff-1'
  );
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const selectedStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 4) {
          const next = pin + e.key;
          sound.playClick();
          setPin(next);
          if (next.length === 4) {
            handleAttemptLogin(next);
          }
        }
      } else if (e.key === 'Backspace') {
        sound.playClick();
        setPin((prev) => prev.slice(0, -1));
        setErrorMsg('');
      } else if (e.key === 'Escape') {
        setPin('');
        setErrorMsg('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedStaffId]);

  const handleAttemptLogin = (pinCode: string) => {
    const res = loginWithPin(selectedStaffId, pinCode);
    if (res.success) {
      sound.playSuccess();
      showToast({
        type: 'success',
        title: 'Welcome Back',
        message: `${selectedStaff.name} · ${selectedStaff.role}`
      });
    } else {
      sound.playError();
      setErrorMsg(res.message || 'Incorrect PIN');
      setPin('');
    }
  };

  const handleKeypadDigit = (digit: string) => {
    if (pin.length < 4) {
      sound.playClick();
      setErrorMsg('');
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        handleAttemptLogin(next);
      }
    }
  };

  const handleKeypadDelete = () => {
    sound.playClick();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', 'DEL']
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col justify-between p-8 sm:p-12 select-none overflow-hidden transition-colors">
      {/* Top Header: Café Logo & Clock */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#8B6F5A] flex items-center justify-center text-white shadow-sm">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Northline Café
            </h1>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D]">
              POS Terminal #01
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            {timeString}
          </p>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            {dateString}
          </p>
        </div>
      </div>

      {/* Center Apple-style Auth Interface */}
      <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 my-auto">
        {/* Left Column: Staff Selection Cards */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[480px]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B6F5A] dark:text-[#D4BBA5] mb-1">
            Choose Staff Profile
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-6">
            Who is operating the register?
          </h2>

          <div className="w-full max-w-md mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search staff by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-[14px] py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6F5A]/50 transition-all text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#6E6E73] dark:placeholder-[#98989D]"
              />
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73] dark:text-[#98989D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 max-h-[45vh] lg:max-h-[55vh] overflow-y-auto pr-2 pb-2" style={{ scrollbarWidth: 'thin' }}>
              {staffList
                .filter(s => 
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  s.role.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((s) => {
                const isSelected = selectedStaffId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedStaffId(s.id);
                      setPin('');
                      setErrorMsg('');
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-[18px] border text-left transition-all duration-200 active:scale-[0.98]',
                      isSelected
                        ? 'bg-white dark:bg-[#1C1C1E] border-[#8B6F5A] shadow-md ring-2 ring-[#8B6F5A]/40'
                        : 'bg-white/60 dark:bg-[#1C1C1E]/60 border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-[#1C1C1E] opacity-75 hover:opacity-100'
                    )}
                  >
                    {s.avatar ? (
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-12 h-12 rounded-full object-cover shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#8B6F5A]/15 text-[#8B6F5A] font-bold text-base flex items-center justify-center shrink-0">
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] truncate leading-snug">
                        {s.name}
                      </p>
                      <span className="inline-block text-[10px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
                        {s.role}
                      </span>
                    </div>
                  </button>
                );
              })}
              {staffList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="col-span-2 text-center py-8 text-sm text-[#6E6E73] dark:text-[#98989D]">
                  No staff members found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Keypad Card */}
        <div className="w-full max-w-[320px] bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-xl border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center">
          {/* Active Avatar */}
          <div className="flex flex-col items-center mb-3">
            {selectedStaff.avatar ? (
              <img
                src={selectedStaff.avatar}
                alt={selectedStaff.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-[#8B6F5A]/20 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#8B6F5A]/20 text-[#8B6F5A] font-bold text-xl flex items-center justify-center">
                {selectedStaff.name.charAt(0)}
              </div>
            )}
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-2">
              {selectedStaff.name}
            </h3>
            <span className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
              {selectedStaff.role}
            </span>
          </div>

          {/* PIN Dots Display */}
          <div className="flex items-center gap-3.5 my-3 h-6">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={cn(
                    'w-3.5 h-3.5 rounded-full transition-all duration-150',
                    isFilled
                      ? 'bg-[#8B6F5A] scale-110 shadow-xs'
                      : 'bg-black/10 dark:bg-white/20'
                  )}
                />
              );
            })}
          </div>

          {errorMsg ? (
            <p className="text-xs font-semibold text-[#FF3B30] mb-3 animate-shake">
              {errorMsg}
            </p>
          ) : (
            <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mb-3">
              Enter 4-digit PIN
            </p>
          )}

          {/* Tactile Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {keypadRows.map((row, rIdx) =>
              row.map((btn, cIdx) => {
                if (btn === 'DEL') {
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      onClick={handleKeypadDelete}
                      className="h-12 rounded-[14px] bg-black/[0.03] hover:bg-black/[0.07] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-[#6E6E73] dark:text-[#98989D] flex items-center justify-center transition-all active:scale-95"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  );
                }
                if (btn === 'C') {
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPin('');
                        setErrorMsg('');
                      }}
                      className="h-12 rounded-[14px] bg-black/[0.03] hover:bg-black/[0.07] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-xs font-bold text-[#6E6E73] dark:text-[#98989D] flex items-center justify-center transition-all active:scale-95"
                    >
                      Clear
                    </button>
                  );
                }
                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    type="button"
                    onClick={() => handleKeypadDigit(btn)}
                    className="h-12 rounded-[14px] bg-black/[0.02] hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center transition-all active:scale-95"
                  >
                    {btn}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Demo PIN Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1 mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] w-full text-[10px] text-[#6E6E73] dark:text-[#98989D]">
            <span className="opacity-70">Demo PIN:</span>
            <button
              type="button"
              onClick={() => {
                setPin(selectedStaff.pin);
                handleAttemptLogin(selectedStaff.pin);
              }}
              className="px-2 py-0.5 rounded bg-black/[0.04] hover:bg-[#8B6F5A]/20 hover:text-[#8B6F5A] font-mono font-bold"
            >
              Fill ({selectedStaff.pin})
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full text-center text-xs text-[#6E6E73] dark:text-[#98989D]">
        Northline Café · Commercial POS System
      </div>
    </div>
  );
};
